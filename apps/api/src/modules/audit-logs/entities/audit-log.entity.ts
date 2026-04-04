import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
  Index,
} from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

@Entity({ name: 'audit_logs' })
@Index(['targetType', 'targetId'])
@Index(['performedById'])
@Index(['createdAt'])
export class AuditLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'performed_by_id', type: 'uuid', nullable: true })
  performedById: string | null;

  @Column({ name: 'target_id', type: 'varchar', nullable: true })
  targetId: string | null;

  @Column({ name: 'target_type', type: 'varchar', length: 100, nullable: true })
  targetType: string | null;

  @Column({ name: 'action', type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @ManyToOne(() => Staff, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'performed_by_id' })
  performedBy: Staff | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
