import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Order } from './order.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum OrderPaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DENIED = 'denied',
}

export enum OrderPaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  OTHER = 'other',
}

@Entity({ name: 'order_payments' })
export class OrderPayment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

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
    enum: OrderPaymentMethod,
  })
  method: OrderPaymentMethod;

  @Column({ name: 'reference', type: 'varchar', nullable: true })
  reference: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderPaymentStatus,
    default: OrderPaymentStatus.PENDING,
  })
  status: OrderPaymentStatus;

  @Column({ name: 'confirmed_by_id', type: 'uuid', nullable: true })
  confirmedById: string | null;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'confirmed_by_id' })
  confirmedBy: Staff;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
