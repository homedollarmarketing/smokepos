import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum MessageStatus {
  UNREAD = 'unread',
  READ = 'read',
  REPLIED = 'replied',
}

@Entity({ name: 'contact_messages' })
@Index(['branchId', 'status'])
@Index(['createdAt'])
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'subject', type: 'varchar', length: 255 })
  subject: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.UNREAD,
  })
  status: MessageStatus;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'reply_content', type: 'text', nullable: true })
  replyContent: string | null;

  @Column({ name: 'replied_at', type: 'timestamptz', nullable: true })
  repliedAt: Date | null;

  @Column({ name: 'replied_by', type: 'uuid', nullable: true })
  repliedBy: string | null;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'replied_by' })
  repliedByStaff: Staff | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
