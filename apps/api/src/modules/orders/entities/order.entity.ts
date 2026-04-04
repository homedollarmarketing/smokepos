import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BaseEntity,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderPayment } from './order-payment.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'orders' })
@Index(['orderId'], { unique: true })
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Human-readable ID: ORD-{YYYYMM}-{SEQ}
  @Column({ name: 'order_id', type: 'varchar', length: 50, unique: true })
  orderId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount: number;

  @Column({
    name: 'amount_paid',
    type: 'numeric',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amountPaid: number;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  // Cancellation fields
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancelled_by_id', type: 'uuid', nullable: true })
  cancelledById: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelledBy: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderPayment, (payment) => payment.order, { cascade: true })
  payments: OrderPayment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed property for balance
  get balance(): number {
    return this.totalAmount - this.amountPaid;
  }
}
