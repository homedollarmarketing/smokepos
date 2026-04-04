import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('categories')
@Unique(['name', 'branchId'])
@Unique(['slug', 'branchId'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'slug' })
  slug: string;

  @Column({ name: 'description', nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'image', nullable: true })
  image: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
