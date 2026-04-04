import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

export interface AuditLogQueryDto {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
  performedById?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {}

  async logAction(dto: CreateAuditLogDto): Promise<void> {
    try {
      const log = this.auditLogRepository.create({
        performedById: dto.staffId,
        action: dto.action,
        targetType: dto.entity,
        targetId: dto.entityId,
        metadata: dto.details,
        description:
          dto.description || `${dto.action} on ${dto.entity} ${dto.entityId || ''}`.trim(),
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      });

      await this.auditLogRepository.save(log);
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // We don't throw here to avoid failing the main action if logging fails
    }
  }

  async findAll(query: AuditLogQueryDto) {
    const { page = 1, limit = 20, action, targetType, performedById, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const qb = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.performedBy', 'performedBy');

    if (action) {
      qb.andWhere('audit.action = :action', { action });
    }

    if (targetType) {
      qb.andWhere('audit.targetType = :targetType', { targetType });
    }

    if (performedById) {
      qb.andWhere('audit.performedById = :performedById', { performedById });
    }

    if (startDate) {
      qb.andWhere('audit.createdAt >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      qb.andWhere('audit.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    qb.orderBy('audit.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

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

  async getActionTypes(): Promise<string[]> {
    const result = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('DISTINCT audit.action', 'action')
      .getRawMany();
    return result.map((r) => r.action).filter(Boolean);
  }

  async getEntityTypes(): Promise<string[]> {
    const result = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('DISTINCT audit.targetType', 'targetType')
      .getRawMany();
    return result.map((r) => r.targetType).filter(Boolean);
  }
}
