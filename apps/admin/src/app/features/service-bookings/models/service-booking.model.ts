import { Customer } from '../../customers/models/customer.model';
import { Vehicle } from '../../customers/models/customer.model';

export type ServiceType =
  | 'maintenance'
  | 'repair'
  | 'diagnostic'
  | 'oil_change'
  | 'brake_service'
  | 'tire_service'
  | 'electrical'
  | 'engine'
  | 'transmission'
  | 'suspension'
  | 'other';

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export const BookingStatus = {
  PENDING: 'pending' as BookingStatus,
  CONFIRMED: 'confirmed' as BookingStatus,
  IN_PROGRESS: 'in_progress' as BookingStatus,
  COMPLETED: 'completed' as BookingStatus,
  CANCELLED: 'cancelled' as BookingStatus,
};

export interface ServiceBooking {
  id: string;
  customerId: string;
  vehicleId: string | null;
  branchId: string;
  serviceType: ServiceType;
  description: string | null;
  preferredDate: string;
  preferredTime: string | null;
  status: BookingStatus;
  adminNotes: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  confirmedDate: string | null;
  confirmedTime: string | null;
  completedAt: string | null;
  serviceNotes: string | null;
  customer?: Customer;
  vehicle?: Vehicle | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateServiceBookingDto {
  customerId: string;
  vehicleId: string;
  serviceType: ServiceType;
  preferredDate: string;
  preferredTime?: string;
  serviceNotes?: string;
  estimatedCost?: number;
  adminNotes?: string;
}

export interface UpdateServiceBookingDto {
  vehicleId?: string;
  serviceType?: ServiceType;
  preferredDate?: string | null;
  preferredTime?: string | null;
  status?: BookingStatus;
  confirmedDate?: string | null;
  confirmedTime?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  adminNotes?: string | null;
  serviceNotes?: string | null;
}

export interface ServiceBookingQueryDto {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  serviceType?: ServiceType;
  search?: string;
  customerId?: string;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  maintenance: 'Scheduled Maintenance',
  repair: 'General Repair',
  diagnostic: 'Diagnostic Check',
  oil_change: 'Oil Change',
  brake_service: 'Brake Service',
  tire_service: 'Tire Service',
  electrical: 'Electrical',
  engine: 'Engine Work',
  transmission: 'Transmission',
  suspension: 'Suspension',
  other: 'Other',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const BOOKING_STATUS_COLORS: Record<
  BookingStatus,
  'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
> = {
  pending: 'warn',
  confirmed: 'info',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
};

// Legacy exports for compatibility
export const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = Object.entries(
  SERVICE_TYPE_LABELS
).map(([value, label]) => ({ value: value as ServiceType, label }));

export const BOOKING_STATUS_OPTIONS: { value: BookingStatus; label: string; severity: string }[] = [
  { value: 'pending', label: 'Pending', severity: 'warning' },
  { value: 'confirmed', label: 'Confirmed', severity: 'info' },
  { value: 'in_progress', label: 'In Progress', severity: 'primary' },
  { value: 'completed', label: 'Completed', severity: 'success' },
  { value: 'cancelled', label: 'Cancelled', severity: 'danger' },
];

export function getServiceTypeLabel(type: ServiceType): string {
  return SERVICE_TYPE_LABELS[type] || type;
}

export function getBookingStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status] || status;
}

export function getBookingStatusSeverity(
  status: BookingStatus
): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
  return BOOKING_STATUS_COLORS[status] || 'secondary';
}
