import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DENIED = 'denied',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
  OTHER = 'other',
}

@Entity({ name: 'sale_payments' })
export class SalePayment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sale_id', type: 'uuid' })
  saleId: string;

  @ManyToOne(() => Sale, (sale) => sale.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({
    name: 'amount',
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({
    name: 'method',
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({ name: 'reference', type: 'varchar', nullable: true })
  reference: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'recorded_by_id', type: 'uuid' })
  recordedById: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'recorded_by_id' })
  recordedBy: Staff;

  @Column({ name: 'approved_by_id', type: 'uuid', nullable: true })
  approvedById: string | null;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: Staff;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
