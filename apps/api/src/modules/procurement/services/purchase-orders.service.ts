import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, DataSource } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Supplier } from '../entities/supplier.entity';
import { Product } from '../../products/entities/product.entity';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrdersQueryDto,
  ReceiveItemsDto,
  RejectPurchaseOrderDto,
} from '../dto';
import { createPaginationMeta } from '../../../common/dto/pagination.dto';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { StockAdjustmentsService } from '../../products/services/stock-adjustments.service';
import { StockAdjustmentType } from '../../products/entities/stock-adjustment.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly poItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly auditLogsService: AuditLogsService,
    private readonly dataSource: DataSource,
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {}

  /**
   * Generate PO number: PO-{BRANCH_SLUG}-{YYYYMM}-{SEQ}
   */
  private async generatePoNumber(branchId: string): Promise<string> {
    const branch = await this.branchRepository.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new BadRequestException('Invalid branch');
    }

    const branchCode = branch.slug.toUpperCase().replace(/-/g, '');
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `PO-${branchCode}-${yearMonth}-`;

    // Find the highest sequence number for this prefix
    const lastPo = await this.poRepository
      .createQueryBuilder('po')
      .where('po.poNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('po.poNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastPo) {
      const lastSeq = parseInt(lastPo.poNumber.split('-').pop() || '0', 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(3, '0')}`;
  }

  /**
   * Calculate total amount from items
   */
  private calculateTotalAmount(items: { quantity: number; unitCost: number }[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  }

  /**
   * Validate that status allows editing
   */
  private validateEditableStatus(status: PurchaseOrderStatus): void {
    const editableStatuses = [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.PENDING_APPROVAL];
    if (!editableStatuses.includes(status)) {
      throw new BadRequestException(
        `Purchase order cannot be modified in ${status} status. Only draft or pending approval orders can be edited.`
      );
    }
  }

  async create(createDto: CreatePurchaseOrderDto, staffId?: string | null) {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to create purchase orders');
    }

    // Validate branch
    const branch = await this.branchRepository.findOne({ where: { id: createDto.branchId } });
    if (!branch) {
      throw new BadRequestException('Invalid branch');
    }

    // Validate supplier belongs to branch
    const supplier = await this.supplierRepository.findOne({
      where: { id: createDto.supplierId, branchId: createDto.branchId },
    });
    if (!supplier) {
      throw new BadRequestException('Supplier not found or does not belong to this branch');
    }

    // Validate products and build items
    const productIds = createDto.items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Generate PO number
    const poNumber = await this.generatePoNumber(createDto.branchId);

    // Create items with product snapshots
    const items = createDto.items.map((itemDto) => {
      const product = productMap.get(itemDto.productId)!;
      return this.poItemRepository.create({
        productId: itemDto.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: itemDto.quantity,
        unitCost: itemDto.unitCost,
        receivedQuantity: 0,
      });
    });

    const totalAmount = this.calculateTotalAmount(createDto.items);

    const po = this.poRepository.create({
      poNumber,
      supplierId: createDto.supplierId,
      branchId: createDto.branchId,
      status: createDto.status || PurchaseOrderStatus.DRAFT,
      expectedDeliveryDate: createDto.expectedDeliveryDate
        ? new Date(createDto.expectedDeliveryDate)
        : null,
      notes: createDto.notes,
      totalAmount,
      createdById: staffId,
      items,
    });

    const saved = await this.poRepository.save(po);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'CREATE',
      entity: 'purchaseOrder',
      entityId: saved.id,
      description: `Created purchase order: ${saved.poNumber}`,
      details: {
        poNumber: saved.poNumber,
        supplierId: saved.supplierId,
        totalAmount: saved.totalAmount,
      },
    });

    return this.findOne(saved.id);
  }

  async findAll(query: PurchaseOrdersQueryDto) {
    const { page = 1, limit = 20, branchId, supplierId, status, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.poRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.branch', 'branch')
      .leftJoinAndSelect('po.createdBy', 'createdBy')
      .leftJoinAndSelect('po.approvedBy', 'approvedBy');

    if (branchId) {
      queryBuilder.andWhere('po.branchId = :branchId', { branchId });
    }

    if (supplierId) {
      queryBuilder.andWhere('po.supplierId = :supplierId', { supplierId });
    }

    if (status) {
      queryBuilder.andWhere('po.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere('(po.poNumber ILIKE :search OR supplier.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy('po.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: createPaginationMeta({ page, limit }, total),
    };
  }

  async findOne(id: string) {
    const po = await this.poRepository.findOne({
      where: { id },
      relations: ['supplier', 'branch', 'createdBy', 'approvedBy', 'items', 'items.product'],
    });

    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }

    return po;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto, staffId?: string | null) {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to update purchase orders');
    }

    const po = await this.findOne(id);

    // Validate status allows editing
    this.validateEditableStatus(po.status);

    // Update basic fields
    if (updateDto.supplierId) {
      // Validate supplier belongs to same branch
      const supplier = await this.supplierRepository.findOne({
        where: { id: updateDto.supplierId, branchId: po.branchId },
      });
      if (!supplier) {
        throw new BadRequestException('Supplier not found or does not belong to this branch');
      }
      po.supplierId = updateDto.supplierId;
    }

    if (updateDto.expectedDeliveryDate !== undefined) {
      po.expectedDeliveryDate = updateDto.expectedDeliveryDate
        ? new Date(updateDto.expectedDeliveryDate)
        : null;
    }

    if (updateDto.notes !== undefined) {
      po.notes = updateDto.notes;
    }

    if (updateDto.status !== undefined) {
      // Only allow changing to draft or pending_approval
      if (
        updateDto.status !== PurchaseOrderStatus.DRAFT &&
        updateDto.status !== PurchaseOrderStatus.PENDING_APPROVAL
      ) {
        throw new BadRequestException('Can only set status to draft or pending_approval');
      }
      po.status = updateDto.status;
    }

    // Update items if provided
    if (updateDto.items) {
      // Validate products
      const productIds = updateDto.items.map((item) => item.productId).filter(Boolean) as string[];
      const products = await this.productRepository.find({ where: { id: In(productIds) } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Remove existing items
      await this.poItemRepository.delete({ purchaseOrderId: po.id });

      // Create new items
      const newItems = updateDto.items.map((itemDto) => {
        const product = productMap.get(itemDto.productId!);
        if (!product) {
          throw new BadRequestException(`Product not found: ${itemDto.productId}`);
        }
        return this.poItemRepository.create({
          purchaseOrderId: po.id,
          productId: itemDto.productId!,
          productName: product.name,
          productSku: product.sku,
          quantity: itemDto.quantity!,
          unitCost: itemDto.unitCost!,
          receivedQuantity: 0,
        });
      });

      await this.poItemRepository.save(newItems);
      po.totalAmount = this.calculateTotalAmount(
        updateDto.items.map((i) => ({ quantity: i.quantity!, unitCost: i.unitCost! }))
      );
    }

    const updated = await this.poRepository.save(po);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'UPDATE',
      entity: 'purchaseOrder',
      entityId: updated.id,
      description: `Updated purchase order: ${updated.poNumber}`,
      details: updateDto,
    });

    return this.findOne(updated.id);
  }

  async remove(id: string, staffId?: string | null) {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to delete purchase orders');
    }

    const po = await this.findOne(id);

    // Only allow deleting draft orders
    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft purchase orders can be deleted');
    }

    await this.poRepository.remove(po);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'DELETE',
      entity: 'purchaseOrder',
      entityId: id,
      description: `Deleted purchase order: ${po.poNumber}`,
      details: { poNumber: po.poNumber },
    });

    return { message: 'Purchase order deleted successfully' };
  }

  async approve(id: string, staffId?: string | null) {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to approve purchase orders');
    }

    const po = await this.findOne(id);

    if (po.status !== PurchaseOrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending approval orders can be approved');
    }

    po.status = PurchaseOrderStatus.APPROVED;
    po.approvedById = staffId;
    po.approvedAt = new Date();
    po.rejectionReason = null;

    const updated = await this.poRepository.save(po);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'APPROVE',
      entity: 'purchaseOrder',
      entityId: updated.id,
      description: `Approved purchase order: ${updated.poNumber}`,
      details: { poNumber: updated.poNumber },
    });

    return this.findOne(updated.id);
  }

  async reject(id: string, rejectDto: RejectPurchaseOrderDto, staffId?: string | null) {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to reject purchase orders');
    }

    const po = await this.findOne(id);

    if (po.status !== PurchaseOrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending approval orders can be rejected');
    }

    po.status = PurchaseOrderStatus.DRAFT;
    po.rejectionReason = rejectDto.reason;

    const updated = await this.poRepository.save(po);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'REJECT',
      entity: 'purchaseOrder',
      entityId: updated.id,
      description: `Rejected purchase order: ${updated.poNumber}`,
      details: { poNumber: updated.poNumber, reason: rejectDto.reason },
    });

    return this.findOne(updated.id);
  }

  async cancel(id: string, staffId?: string | null) {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to cancel purchase orders');
    }

    const po = await this.findOne(id);

    // Only draft or pending_approval can be cancelled
    const cancellableStatuses = [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.PENDING_APPROVAL];
    if (!cancellableStatuses.includes(po.status)) {
      throw new BadRequestException(
        `Cannot cancel purchase order in ${po.status} status. Only draft or pending approval orders can be cancelled.`
      );
    }

    po.status = PurchaseOrderStatus.CANCELLED;

    const updated = await this.poRepository.save(po);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'CANCEL',
      entity: 'purchaseOrder',
      entityId: updated.id,
      description: `Cancelled purchase order: ${updated.poNumber}`,
      details: { poNumber: updated.poNumber },
    });

    return this.findOne(updated.id);
  }

  async receiveItems(id: string, receiveDto: ReceiveItemsDto, staffId?: string | null) {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to receive items');
    }

    const po = await this.findOne(id);

    // Only approved or partially_received orders can receive items
    const receivableStatuses = [
      PurchaseOrderStatus.APPROVED,
      PurchaseOrderStatus.PARTIALLY_RECEIVED,
    ];
    if (!receivableStatuses.includes(po.status)) {
      throw new BadRequestException(
        `Cannot receive items for purchase order in ${po.status} status. Only approved or partially received orders can receive items.`
      );
    }

    // Use transaction for inventory updates
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const itemMap = new Map(po.items.map((item) => [item.id, item]));

      for (const receiveItem of receiveDto.items) {
        const poItem = itemMap.get(receiveItem.itemId);
        if (!poItem) {
          throw new BadRequestException(`Item not found: ${receiveItem.itemId}`);
        }

        // Check if receiving more than remaining quantity
        const remainingQty = poItem.quantity - poItem.receivedQuantity;
        if (receiveItem.quantityReceived > remainingQty) {
          throw new BadRequestException(
            `Cannot receive ${receiveItem.quantityReceived} units for ${poItem.productName}. Only ${remainingQty} remaining.`
          );
        }

        // Update received quantity on PO item
        poItem.receivedQuantity += receiveItem.quantityReceived;
        await queryRunner.manager.save(poItem);

        // Update product inventory and cost price (WAC)
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: poItem.productId },
        });
        if (product) {
          const previousQty = product.quantity;
          const previousCostPrice = product.costPrice;
          const rcvQty = receiveItem.quantityReceived;
          const poUnitCost = poItem.unitCost;

          // Calculate Weighted Average Cost (WAC)
          // If previous cost is unknown (null), use PO unit cost as baseline
          const oldCost = previousCostPrice ?? poUnitCost;
          if (previousQty + rcvQty > 0) {
            product.costPrice =
              (previousQty * oldCost + rcvQty * poUnitCost) / (previousQty + rcvQty);
          } else {
            product.costPrice = poUnitCost;
          }

          product.quantity += rcvQty;
          await queryRunner.manager.save(product);

          // Create stock adjustment record
          await this.stockAdjustmentsService.createAdjustmentWithManager(
            queryRunner.manager,
            {
              productId: product.id,
              branchId: po.branchId,
              adjustmentType: StockAdjustmentType.PROCUREMENT_RECEIPT,
              quantityChange: rcvQty,
              previousQuantity: previousQty,
              newQuantity: product.quantity,
              unitCost: poUnitCost,
              previousCostPrice,
              newCostPrice: product.costPrice,
              referenceType: 'purchase_order',
              referenceId: po.id,
              referenceCode: po.poNumber,
              staffId,
            },
          );

          // Audit log for inventory update
          await this.auditLogsService.logAction({
            staffId,
            action: 'INVENTORY_UPDATE',
            entity: 'product',
            entityId: product.id,
            description: `Received ${rcvQty} units from PO ${po.poNumber}`,
            details: {
              poNumber: po.poNumber,
              poItemId: poItem.id,
              productName: product.name,
              previousQuantity: previousQty,
              receivedQuantity: rcvQty,
              newQuantity: product.quantity,
              previousCostPrice,
              newCostPrice: product.costPrice,
              unitCost: poUnitCost,
            },
          });
        }
      }

      // Reload items to check if all received
      const updatedItems = await queryRunner.manager.find(PurchaseOrderItem, {
        where: { purchaseOrderId: po.id },
      });

      const allReceived = updatedItems.every((item) => item.receivedQuantity >= item.quantity);
      const anyReceived = updatedItems.some((item) => item.receivedQuantity > 0);

      if (allReceived) {
        po.status = PurchaseOrderStatus.RECEIVED;
      } else if (anyReceived) {
        po.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
      }

      await queryRunner.manager.save(po);

      await queryRunner.commitTransaction();

      // Audit log for receiving
      await this.auditLogsService.logAction({
        staffId,
        action: 'RECEIVE',
        entity: 'purchaseOrder',
        entityId: po.id,
        description: `Received items for purchase order: ${po.poNumber}`,
        details: {
          poNumber: po.poNumber,
          itemsReceived: receiveDto.items,
          newStatus: po.status,
        },
      });

      return this.findOne(po.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async submitForApproval(id: string, staffId?: string | null) {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to submit for approval');
    }

    const po = await this.findOne(id);

    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft orders can be submitted for approval');
    }

    if (po.items.length === 0) {
      throw new BadRequestException('Cannot submit empty purchase order for approval');
    }

    po.status = PurchaseOrderStatus.PENDING_APPROVAL;

    const updated = await this.poRepository.save(po);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'SUBMIT_FOR_APPROVAL',
      entity: 'purchaseOrder',
      entityId: updated.id,
      description: `Submitted purchase order for approval: ${updated.poNumber}`,
      details: { poNumber: updated.poNumber },
    });

    return this.findOne(updated.id);
  }
}
