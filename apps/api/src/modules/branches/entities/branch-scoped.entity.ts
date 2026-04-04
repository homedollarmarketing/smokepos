import { BaseEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Branch } from './branch.entity';

export abstract class BranchScopedEntity extends BaseEntity {
  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
