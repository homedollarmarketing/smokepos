import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  Index,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ExpenseCategory {
  RENT = 'rent',
  TRANSPORT = 'transport',
  SALARY = 'salary',
  ALLOWANCE = 'allowance',
  UTILITIES = 'utilities',
  SUPPLIES = 'supplies',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  EQUIPMENT = 'equipment',
  COMMUNICATION = 'communication',
  TRAVEL = 'travel',
  TRAINING = 'training',
  FOOD = 'food',
  MISCELLANEOUS = 'miscellaneous',
}

@Entity({ name: 'expenses' })
@Index(['expenseId'], { unique: true })
@Index(['branchId', 'status'])
@Index(['branchId', 'expenseDate'])
export class Expense extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Human-readable ID: EXP-{BRANCH_SLUG}-{YYYYMM}-{SEQ}
  @Column({ name: 'expense_id', type: 'varchar', length: 50, unique: true })
  expenseId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({
    name: 'category',
    type: 'enum',
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;

  @Column({ name: 'expense_date', type: 'date' })
  expenseDate: Date;

  @Column({ name: 'receipt_url', type: 'varchar', length: 500, nullable: true })
  receiptUrl: string | null;

  // Tagged staff member (optional - who the expense is for)
  @Column({ name: 'staff_id', type: 'uuid', nullable: true })
  staffId: string | null;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status: ExpenseStatus;

  // Created by (who added the expense)
  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: Staff;

  // Review tracking
  @Column({ name: 'reviewed_by_id', type: 'uuid', nullable: true })
  reviewedById: string | null;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: Staff;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
