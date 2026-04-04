import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'purchase_order_id', type: 'uuid' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Snapshot of product info at time of order
  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName: string;

  @Column({ name: 'product_sku', type: 'varchar', length: 100, nullable: true })
  productSku: string | null;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({
    name: 'unit_cost',
    type: 'numeric',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  unitCost: number;

  // Track received quantity for partial receiving
  @Column({ name: 'received_quantity', type: 'int', default: 0 })
  receivedQuantity: number;

  // Computed property (not stored in DB)
  get totalCost(): number {
    return this.quantity * this.unitCost;
  }

  get remainingQuantity(): number {
    return this.quantity - this.receivedQuantity;
  }

  get isFullyReceived(): boolean {
    return this.receivedQuantity >= this.quantity;
  }
}
