import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SalePayment, PaymentStatus } from '../entities/sale-payment.entity';
import { SalesService } from './sales.service';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { PaymentApprovalDto } from '../dto/payment-approval.dto';
import { PaymentsQueryDto } from '../dto/payments-query.dto';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { createPaginationMeta } from '../../../common/dto/pagination.dto';

@Injectable()
export class SalesPaymentsService {
  constructor(
    @InjectRepository(SalePayment)
    private readonly paymentRepository: Repository<SalePayment>,
    private readonly salesService: SalesService,
    private readonly dataSource: DataSource,
    private readonly auditLogsService: AuditLogsService
  ) {}

  /**
   * Find all payments with optional filters (status, branchId)
   */
  async findAll(query: PaymentsQueryDto) {
    const { page = 1, limit = 20, status, branchId } = query;

    const skip = (page - 1) * limit;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.sale', 'sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('payment.recordedBy', 'recordedBy')
      .leftJoinAndSelect('payment.approvedBy', 'approvedBy');

    // Filter by status
    if (status) {
      qb.andWhere('payment.status = :status', { status });
    }

    // Filter by branch (through sale relationship)
    if (branchId) {
      qb.andWhere('sale.branchId = :branchId', { branchId });
    }

    qb.orderBy('payment.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: createPaginationMeta(query, total),
    };
  }

  /**
   * Find a single payment by ID with all relations
   */
  async findOne(id: string): Promise<SalePayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'sale',
        'sale.customer',
        'sale.items',
        'sale.items.product',
        'recordedBy',
        'approvedBy',
      ],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async recordPayment(
    saleId: string,
    dto: RecordPaymentDto,
    staffId?: string | null
  ): Promise<SalePayment> {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to record payments');
    }

    const sale = await this.salesService.findOne(saleId);

    const payment = this.paymentRepository.create({
      saleId: sale.id,
      amount: dto.amount,
      method: dto.method,
      reference: dto.reference,
      notes: dto.notes,
      recordedById: staffId,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Audit log
    await this.auditLogsService.logAction({
      staffId,
      action: 'RECORD_PAYMENT',
      entity: 'sale_payment',
      entityId: savedPayment.id,
      description: `Recorded payment of ${dto.amount} for sale ${sale.saleId}`,
      details: { saleId: sale.saleId, amount: dto.amount, method: dto.method },
    });

    return savedPayment;
  }

  async processApproval(
    paymentId: string,
    dto: PaymentApprovalDto,
    staffId?: string | null
  ): Promise<SalePayment> {
    if (!staffId) {
      throw new UnauthorizedException('Staff identification required to process payment approvals');
    }

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['sale'],
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is already processed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      payment.status = dto.status;
      payment.approvedById = staffId;
      payment.approvedAt = new Date();
      if (dto.notes) payment.notes = dto.notes;

      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();

      // If confirmed, update sale balance (after commit to ensure payment is saved)
      if (dto.status === PaymentStatus.CONFIRMED) {
        await this.salesService.updateBalance(payment.saleId, payment.amount);
      }

      // Audit log
      const actionVerb = dto.status === PaymentStatus.CONFIRMED ? 'approved' : 'denied';
      await this.auditLogsService.logAction({
        staffId,
        action: dto.status === PaymentStatus.CONFIRMED ? 'APPROVE_PAYMENT' : 'DENY_PAYMENT',
        entity: 'sale_payment',
        entityId: payment.id,
        description: `Payment of ${payment.amount} ${actionVerb} for sale ${payment.sale?.saleId || payment.saleId}`,
        details: { paymentId: payment.id, amount: payment.amount, status: dto.status },
      });

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get pending payments count for a branch (for sidebar badge)
   */
  async getPendingCount(branchId: string): Promise<{ pending: number }> {
    const pending = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.sale', 'sale')
      .where('payment.status = :status', { status: PaymentStatus.PENDING })
      .andWhere('sale.branchId = :branchId', { branchId })
      .getCount();

    return { pending };
  }
}
