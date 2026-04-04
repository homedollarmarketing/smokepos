import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';
import { Session } from '../../auth/entities/session.entity';
import { OTP } from '../../auth/entities/otp.entity';
import { Customer } from '../../customers/entities/customer.entity';

@Entity({ name: 'users' })
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'hashed_password', type: 'varchar', select: false })
  hashedPassword: string;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'account_type', type: 'varchar', length: 50 })
  accountType: 'admin' | 'customer';

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToOne(() => Staff, (staff) => staff.user, { nullable: true })
  staffAccount: Staff | null;

  @OneToOne(() => Customer, (customer) => customer.user, { nullable: true })
  customerAccount: Customer | null;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => OTP, (otp) => otp.user)
  otps!: OTP[];
}
