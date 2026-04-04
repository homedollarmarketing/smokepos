import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
  Index,
} from 'typeorm';

import { User } from './user.entity';

export enum OTPType {
  LOGIN = 'login',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

@Entity({ name: 'otps' })
@Index(['userId'])
@Index(['token'])
@Index(['verificationToken'])
@Index(['expiresAt'])
export class OTP extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'verification_token', type: 'uuid' })
  verificationToken: string;

  @Column({ name: 'token', type: 'varchar', length: 6 })
  token: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: OTPType,
  })
  type: OTPType;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  get isValid(): boolean {
    return !this.usedAt && this.expiresAt > new Date();
  }
}
