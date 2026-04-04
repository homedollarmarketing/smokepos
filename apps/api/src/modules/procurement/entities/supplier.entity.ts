import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('suppliers')
@Index(['code'], { unique: true })
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Human-readable code: SUP-{BRANCH_SLUG}-{SEQ}
  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'contact_person', type: 'varchar', length: 255, nullable: true })
  contactPerson: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Branch-scoped
  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
