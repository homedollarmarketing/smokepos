import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Customer } from '../../customers/entities/customer.entity';
import { Vehicle } from '../../customers/entities/vehicle.entity';
import { Branch } from '../../branches/entities/branch.entity';

export enum ServiceType {
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  DIAGNOSTIC = 'diagnostic',
  OIL_CHANGE = 'oil_change',
  BRAKE_SERVICE = 'brake_service',
  TIRE_SERVICE = 'tire_service',
  ELECTRICAL = 'electrical',
  ENGINE = 'engine',
  TRANSMISSION = 'transmission',
  SUSPENSION = 'suspension',
  OTHER = 'other',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'service_bookings' })
export class ServiceBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string | null;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @Column({
    name: 'service_type',
    type: 'enum',
    enum: ServiceType,
    default: ServiceType.MAINTENANCE,
  })
  serviceType: ServiceType;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'preferred_date', type: 'date' })
  preferredDate: Date;

  @Column({ name: 'preferred_time', type: 'varchar', length: 10, nullable: true })
  preferredTime: string | null;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedCost: number | null;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualCost: number | null;

  @Column({ name: 'confirmed_date', type: 'date', nullable: true })
  confirmedDate: Date | null;

  @Column({ name: 'confirmed_time', type: 'varchar', length: 10, nullable: true })
  confirmedTime: string | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'service_notes', type: 'text', nullable: true })
  serviceNotes: string | null;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Vehicle, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle | null;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
