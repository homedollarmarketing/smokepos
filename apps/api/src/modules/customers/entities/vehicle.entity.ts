import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Brand } from '../../products/entities/brand.entity';

@Entity({ name: 'vehicles' })
export class Vehicle extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'customer_id', type: 'uuid' })
    customerId: string;

    @Column({ name: 'brand_id', type: 'uuid', nullable: true })
    brandId: string | null;

    @Column({ type: 'varchar', length: 200 })
    name: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    color: string | null;

    @Column({ name: 'number_plate', type: 'varchar', length: 20, nullable: true })
    numberPlate: string | null;

    @Column({ name: 'vin_number', type: 'varchar', length: 50, nullable: true })
    vinNumber: string | null;

    @Column({ type: 'integer' })
    year: number;

    @ManyToOne(() => Customer, (customer) => customer.vehicles, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => Brand, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'brand_id' })
    brand: Brand | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
