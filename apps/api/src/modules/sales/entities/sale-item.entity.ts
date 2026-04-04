import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    BaseEntity,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'sale_items' })
export class SaleItem extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'sale_id', type: 'uuid' })
    saleId: string;

    @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'quantity', type: 'int' })
    quantity: number;

    @Column({
        name: 'unit_price',
        type: 'numeric',
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    unitPrice: number;

    @Column({
        name: 'unit_cost',
        type: 'numeric',
        nullable: true,
        default: null,
        transformer: {
            to: (value: number | null) => value,
            from: (value: string | null) => (value !== null ? parseFloat(value) : null),
        },
    })
    unitCost: number | null;

    // Computed property, not stored in DB
    get totalPrice(): number {
        return this.quantity * this.unitPrice;
    }

    get grossProfit(): number | null {
        if (this.unitCost === null || this.unitCost === undefined) return null;
        return (this.unitPrice - this.unitCost) * this.quantity;
    }
}
