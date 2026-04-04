import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, ILike, In } from 'typeorm';
import { format } from 'date-fns';

import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderPayment, OrderPaymentStatus } from './entities/order-payment.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersQueryDto } from './dto/orders-query.dto';
import { RecordOrderPaymentDto } from './dto/record-order-payment.dto';
import { Product } from '../products/entities/product.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Customer } from '../customers/entities/customer.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { EmailService } from '../shared/services/email.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderPayment)
    private readonly orderPaymentRepository: Repository<OrderPayment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly dataSource: DataSource,
    private readonly auditLogsService: AuditLogsService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Get the main branch (isMain = true)
   */
  private async getMainBranch(): Promise<Branch> {
    const mainBranch = await this.branchRepository.findOne({
      where: { isMain: true, isActive: true },
    });
    if (!mainBranch) {
      throw new NotFoundException('Main branch not configured');
    }
    return mainBranch;
  }

  /**
   * Create a new order (customer-facing)
   * Validates stock availability but does NOT deduct stock until CONFIRMED
   */
  async create(createOrderDto: CreateOrderDto, customerId: string): Promise<Order> {
    const { items, shippingAddress, notes } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get main branch
      const mainBranch = await this.getMainBranch();

      // 2. Validate Customer exists
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: customerId },
      });
      if (!customer) throw new NotFoundException('Customer not found');

      // 3. Generate Order ID
      const orderId = await this.generateOrderIdWithLock(queryRunner);

      // 4. Process Items & Validate Stock (no deduction yet)
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId, branchId: mainBranch.id, isActive: true },
        });
        if (!product) {
          throw new NotFoundException(`Product ${itemDto.productId} not found or not available`);
        }

        // Validate sufficient stock
        if (product.quantity < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${itemDto.quantity}`
          );
        }

        const itemTotal = Number(product.price) * itemDto.quantity;
        totalAmount += itemTotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          productId: itemDto.productId,
          productName: product.name,
          quantity: itemDto.quantity,
          unitPrice: product.price,
        });
        orderItems.push(orderItem);
      }

      // 5. Create Order
      const order = queryRunner.manager.create(Order, {
        orderId,
        branchId: mainBranch.id,
        customerId,
        status: OrderStatus.PENDING,
        totalAmount,
        amountPaid: 0,
        shippingAddress,
        notes,
        items: orderItems,
      });

      await queryRunner.manager.save(order);

      // 6. Update customer's shipping address
      customer.shippingAddress = shippingAddress;
      await queryRunner.manager.save(customer);

      await queryRunner.commitTransaction();

      // 7. Send order confirmation email
      await this.sendOrderConfirmationEmail(order, customer);

      return this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all orders (admin)
   */
  async findAll(query: OrdersQueryDto) {
    const { page = 1, limit = 20, search, status, customerId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) where.orderId = ILike(`%${search}%`);
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['customer', 'branch'],
    });

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get order stats for a customer (dashboard)
   */
  async getCustomerStats(customerId: string) {
    console.log(customerId);
    const totalOrders = await this.orderRepository.count({
      where: { customerId },
    });

    const activeOrders = await this.orderRepository.count({
      where: {
        customerId,
        status: In(['pending', 'confirmed', 'processing', 'shipped']),
      },
    });

    return {
      totalOrders,
      activeOrders,
    };
  }

  /**
   * Find all orders for a specific customer (customer-facing)
   */
  async findAllByCustomer(customerId: string, query: OrdersQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { customerId };
    if (status) where.status = status;

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Find one order by ID
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'payments',
        'payments.confirmedBy',
        'customer',
        'branch',
      ],
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  /**
   * Update order status (admin only)
   * Deducts stock on CONFIRMED
   */
  async updateStatus(id: string, newStatus: OrderStatus, staffId?: string | null): Promise<Order> {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to update order status');
    }

    const order = await this.findOne(id);
    const oldStatus = order.status;

    // Validate state transition
    this.validateStateTransition(order.status, newStatus, order.balance);

    // If confirming, deduct stock
    if (newStatus === OrderStatus.CONFIRMED && oldStatus === OrderStatus.PENDING) {
      await this.deductStock(order);
    }

    order.status = newStatus;
    const updatedOrder = await this.orderRepository.save(order);

    // Send status update email
    const customer = await this.customerRepository.findOne({ where: { id: order.customerId } });
    if (customer) {
      await this.sendOrderStatusEmail(order, customer, newStatus);
    }

    // Audit log (staff action)
    await this.auditLogsService.logAction({
      staffId,
      action: 'UPDATE_STATUS',
      entity: 'order',
      entityId: order.id,
      description: `Changed order ${order.orderId} status from ${oldStatus} to ${newStatus}`,
      details: { orderId: order.orderId, oldStatus, newStatus },
    });

    return updatedOrder;
  }

  /**
   * Cancel order by customer (only PENDING or CONFIRMED)
   */
  async cancelByCustomer(id: string, reason: string, customerId: string): Promise<Order> {
    const order = await this.findOne(id);

    // Verify ownership
    if (order.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return this.cancelOrder(order, reason, null);
  }

  /**
   * Cancel order by staff (only PENDING or CONFIRMED)
   */
  async cancelByStaff(id: string, reason: string, staffId?: string | null): Promise<Order> {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to cancel orders');
    }

    const order = await this.findOne(id);
    const cancelledOrder = await this.cancelOrder(order, reason, staffId);

    // Audit log (staff action)
    await this.auditLogsService.logAction({
      staffId,
      action: 'CANCEL',
      entity: 'order',
      entityId: order.id,
      description: `Cancelled order ${order.orderId}`,
      details: { orderId: order.orderId, reason },
    });

    return cancelledOrder;
  }

  /**
   * Internal cancel order logic
   */
  private async cancelOrder(
    order: Order,
    reason: string,
    cancelledById: string | null
  ): Promise<Order> {
    // Only PENDING and CONFIRMED can be cancelled
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}. Only PENDING or CONFIRMED orders can be cancelled.`
      );
    }

    // If was CONFIRMED, restore stock
    if (order.status === OrderStatus.CONFIRMED) {
      await this.restoreStock(order);
    }

    order.status = OrderStatus.CANCELLED;
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    order.cancelledById = cancelledById;

    const cancelledOrder = await this.orderRepository.save(order);

    // Send cancellation email
    const customer = await this.customerRepository.findOne({ where: { id: order.customerId } });
    if (customer) {
      await this.sendOrderCancellationEmail(order, customer, reason);
    }

    return cancelledOrder;
  }

  /**
   * Record a payment (admin only)
   */
  async recordPayment(
    orderId: string,
    dto: RecordOrderPaymentDto,
    staffId?: string | null
  ): Promise<OrderPayment> {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to record payments');
    }

    const order = await this.findOne(orderId);

    // Cannot record payment for cancelled orders
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot record payment for cancelled order');
    }

    const payment = this.orderPaymentRepository.create({
      orderId: order.id,
      amount: dto.amount,
      method: dto.method,
      reference: dto.reference || null,
      notes: dto.notes || null,
      status: OrderPaymentStatus.PENDING,
    });

    await this.orderPaymentRepository.save(payment);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'RECORD_PAYMENT',
      entity: 'order',
      entityId: order.id,
      description: `Recorded payment of ${dto.amount} for order ${order.orderId}`,
      details: { orderId: order.orderId, amount: dto.amount, method: dto.method },
    });

    return payment;
  }

  /**
   * Confirm a payment (admin only)
   */
  async confirmPayment(
    orderId: string,
    paymentId: string,
    staffId?: string | null
  ): Promise<Order> {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to confirm payments');
    }

    const order = await this.findOne(orderId);
    const payment = await this.orderPaymentRepository.findOne({
      where: { id: paymentId, orderId: order.id },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== OrderPaymentStatus.PENDING) {
      throw new BadRequestException(`Payment is already ${payment.status}`);
    }

    // Update payment status
    payment.status = OrderPaymentStatus.CONFIRMED;
    payment.confirmedById = staffId;
    payment.confirmedAt = new Date();
    await this.orderPaymentRepository.save(payment);

    // Update order amountPaid
    order.amountPaid = Number(order.amountPaid) + Number(payment.amount);

    // Auto-complete if fully paid and delivered
    if (order.status === OrderStatus.DELIVERED && order.balance <= 0) {
      // Order is fully paid - can mark as completed if business logic requires
    }

    await this.orderRepository.save(order);

    // Send payment confirmation email
    const customer = await this.customerRepository.findOne({ where: { id: order.customerId } });
    if (customer) {
      await this.sendPaymentConfirmationEmail(order, customer, payment);
    }

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'CONFIRM_PAYMENT',
      entity: 'order',
      entityId: order.id,
      description: `Confirmed payment of ${payment.amount} for order ${order.orderId}`,
      details: { orderId: order.orderId, paymentId, amount: payment.amount },
    });

    return this.findOne(orderId);
  }

  /**
   * Deny a payment (admin only)
   */
  async denyPayment(orderId: string, paymentId: string, staffId?: string | null): Promise<Order> {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to deny payments');
    }

    const order = await this.findOne(orderId);
    const payment = await this.orderPaymentRepository.findOne({
      where: { id: paymentId, orderId: order.id },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== OrderPaymentStatus.PENDING) {
      throw new BadRequestException(`Payment is already ${payment.status}`);
    }

    // Update payment status
    payment.status = OrderPaymentStatus.DENIED;
    payment.confirmedById = staffId;
    payment.confirmedAt = new Date();
    await this.orderPaymentRepository.save(payment);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'DENY_PAYMENT',
      entity: 'order',
      entityId: order.id,
      description: `Denied payment of ${payment.amount} for order ${order.orderId}`,
      details: { orderId: order.orderId, paymentId, amount: payment.amount },
    });

    return this.findOne(orderId);
  }

  /**
   * Deduct stock for all items in an order
   */
  private async deductStock(order: Order): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (product.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.quantity}, Required: ${item.quantity}`
          );
        }

        product.quantity -= item.quantity;
        await queryRunner.manager.save(product);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Restore stock for all items in an order (on cancellation)
   */
  private async restoreStock(order: Order): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (product) {
          product.quantity += item.quantity;
          await queryRunner.manager.save(product);
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Validate state transitions
   */
  private validateStateTransition(current: OrderStatus, next: OrderStatus, balance: number): void {
    if (current === next) return;

    // Terminal states
    if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(current)) {
      throw new BadRequestException(`Cannot change status from terminal state ${current}`);
    }

    const allowed: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowed[current].includes(next)) {
      throw new BadRequestException(`Invalid status transition from ${current} to ${next}`);
    }
  }

  /**
   * Generate order ID with lock
   */
  private async generateOrderIdWithLock(queryRunner: any): Promise<string> {
    const dateStr = format(new Date(), 'yyyyMM');
    const prefix = `ORD-${dateStr}-`;

    const result = await queryRunner.manager.query(
      `SELECT order_id FROM orders WHERE order_id LIKE $1 ORDER BY order_id DESC LIMIT 1 FOR UPDATE`,
      [`${prefix}%`]
    );

    let sequence = 1;
    if (result && result.length > 0) {
      const lastOrderId = result[0].order_id;
      const parts = lastOrderId.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  /**
   * Send order confirmation email
   */
  private async sendOrderConfirmationEmail(order: Order, customer: Customer): Promise<void> {
    const subject = `Order Confirmation - ${order.orderId}`;
    const itemsList = order.items
      .map(
        (item) => `- ${item.productName} x${item.quantity}: ${item.unitPrice.toLocaleString()} each`
      )
      .join('\n');

    const text = `Dear ${customer.name},

Thank you for your order!

Order ID: ${order.orderId}
Status: ${order.status.toUpperCase()}

Items:
${itemsList}

Total: ${order.totalAmount.toLocaleString()}

Shipping Address:
${order.shippingAddress}

Payment Instructions:
Please make payment via bank transfer or mobile money. Your order will be confirmed once payment is received.

Bank Details:
- Bank: [Bank Name]
- Account: [Account Number]
- Reference: ${order.orderId}

Thank you for shopping with SMOKE POS!`;

    try {
      await this.emailService.sendReceipt(customer.email || '', {
        invoiceNumber: order.orderId,
        items: order.items.map((i) => ({
          product: { name: i.productName, price: i.unitPrice },
          quantity: i.quantity,
        })),
        total: order.totalAmount,
        date: order.createdAt,
      });
      this.logger.log(`Order confirmation email sent for ${order.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email for ${order.orderId}`, error);
    }
  }

  /**
   * Send order status email
   */
  private async sendOrderStatusEmail(
    order: Order,
    customer: Customer,
    newStatus: OrderStatus
  ): Promise<void> {
    const statusMessages: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Your order is pending confirmation.',
      [OrderStatus.CONFIRMED]: 'Your order has been confirmed and is being prepared.',
      [OrderStatus.PROCESSING]: 'Your order is being processed.',
      [OrderStatus.SHIPPED]: 'Your order has been shipped and is on its way!',
      [OrderStatus.DELIVERED]: 'Your order has been delivered. Thank you for shopping with us!',
      [OrderStatus.CANCELLED]: 'Your order has been cancelled.',
    };

    const subject = `Order ${order.orderId} - ${newStatus.toUpperCase()}`;
    const text = `Dear ${customer.name},

${statusMessages[newStatus]}

Order ID: ${order.orderId}
New Status: ${newStatus.toUpperCase()}

Thank you for shopping with SMOKE POS!`;

    this.logger.log(
      `[ORDER STATUS EMAIL] To: ${customer.email}, Order: ${order.orderId}, Status: ${newStatus}`
    );
  }

  /**
   * Send order cancellation email
   */
  private async sendOrderCancellationEmail(
    order: Order,
    customer: Customer,
    reason: string
  ): Promise<void> {
    const subject = `Order Cancelled - ${order.orderId}`;
    const text = `Dear ${customer.name},

Your order ${order.orderId} has been cancelled.

Reason: ${reason}

If you have already made a payment, please contact us for a refund.

Thank you for shopping with SMOKE POS!`;

    this.logger.log(
      `[ORDER CANCELLATION EMAIL] To: ${customer.email}, Order: ${order.orderId}, Reason: ${reason}`
    );
  }

  /**
   * Send payment confirmation email
   */
  private async sendPaymentConfirmationEmail(
    order: Order,
    customer: Customer,
    payment: OrderPayment
  ): Promise<void> {
    const remainingBalance = order.totalAmount - order.amountPaid;
    const subject = `Payment Confirmed - ${order.orderId}`;
    const text = `Dear ${customer.name},

Your payment of ${payment.amount.toLocaleString()} for order ${order.orderId} has been confirmed.

Amount Paid: ${payment.amount.toLocaleString()}
Total Paid: ${order.amountPaid.toLocaleString()}
${remainingBalance > 0 ? `Remaining Balance: ${remainingBalance.toLocaleString()}` : 'Order is fully paid!'}

Thank you for your payment!

SMOKE POS`;

    this.logger.log(
      `[PAYMENT CONFIRMATION EMAIL] To: ${customer.email}, Order: ${order.orderId}, Amount: ${payment.amount}`
    );
  }

  /**
   * Get pending orders count (for sidebar badge)
   * Orders are always main branch only
   */
  async getPendingCount(): Promise<{ pending: number }> {
    const mainBranch = await this.getMainBranch();

    const pending = await this.orderRepository.count({
      where: {
        branchId: mainBranch.id,
        status: OrderStatus.PENDING,
      },
    });

    return { pending };
  }
}
