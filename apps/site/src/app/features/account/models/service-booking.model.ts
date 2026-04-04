import { Vehicle } from './vehicle.model';

export type ServiceType =
  | 'maintenance'
  | 'repair'
  | 'diagnostic'
  | 'inspection'
  | 'detailing'
  | 'other';

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string;
  customerId: string;
  vehicleId: string;
  branchId: string;
  serviceType: ServiceType;
  description: string;
  preferredDate: string;
  preferredTime: string | null;
  status: BookingStatus;
  estimatedCost: number | null;
  actualCost: number | null;
  completedAt: string | null;
  serviceNotes: string | null;
  vehicle?: Vehicle;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceBookingDto {
  vehicleId: string;
  serviceType: ServiceType;
  description: string;
  serviceNotes?: string;
  preferredDate: string;
  preferredTime?: string;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  maintenance: 'Scheduled Maintenance',
  repair: 'Repair Service',
  diagnostic: 'Diagnostic Check',
  inspection: 'Vehicle Inspection',
  detailing: 'Detailing & Cleaning',
  other: 'Other Service',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger',
};
