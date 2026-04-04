import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum StockAdjustmentType {
  PROCUREMENT_RECEIPT = 'procurement_receipt',
  SALE = 'sale',
  SALE_CANCELLATION = 'sale_cancellation',
  MANUAL = 'manual',
}

@Entity('stock_adjustments')
@Index(['productId', 'createdAt'])
@Index(['branchId', 'createdAt'])
export class StockAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({
    name: 'adjustment_type',
    type: 'enum',
    enum: StockAdjustmentType,
  })
  adjustmentType: StockAdjustmentType;

  // Positive for stock in, negative for stock out
  @Column({ name: 'quantity_change', type: 'int' })
  quantityChange: number;

  @Column({ name: 'previous_quantity', type: 'int' })
  previousQuantity: number;

  @Column({ name: 'new_quantity', type: 'int' })
  newQuantity: number;

  // Cost per unit at time of adjustment (e.g. PO unitCost or product costPrice)
  @Column({
    name: 'unit_cost',
    type: 'numeric',
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value !== null ? parseFloat(value) : null),
    },
  })
  unitCost: number | null;

  // Product WAC before this adjustment
  @Column({
    name: 'previous_cost_price',
    type: 'numeric',
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value !== null ? parseFloat(value) : null),
    },
  })
  previousCostPrice: number | null;

  // Product WAC after this adjustment
  @Column({
    name: 'new_cost_price',
    type: 'numeric',
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value !== null ? parseFloat(value) : null),
    },
  })
  newCostPrice: number | null;

  // e.g. 'purchase_order', 'sale'
  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType: string | null;

  // UUID of the PO or Sale
  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  // Human-readable ref: PO number or Sale ID
  @Column({ name: 'reference_code', type: 'varchar', length: 100, nullable: true })
  referenceCode: string | null;

  // For manual adjustments
  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string | null;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
