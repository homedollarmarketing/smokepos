import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ServiceBookingsService } from '../../services/service-bookings.service';
import { CustomerVehiclesService } from '../../services/customer-vehicles.service';
import {
  ServiceBooking,
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from '../../models/service-booking.model';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-service-bookings',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './service-bookings.component.html',
  styleUrl: './service-bookings.component.scss',
})
export class ServiceBookingsComponent implements OnInit {
  private readonly bookingsService = inject(ServiceBookingsService);
  private readonly vehiclesService = inject(CustomerVehiclesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // State
  readonly bookings = signal<ServiceBooking[]>([]);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Modal State
  readonly showDetailsModal = signal(false);
  readonly selectedBooking = signal<ServiceBooking | null>(null);

  // Computed: Check if user has vehicles
  readonly hasVehicles = computed(() => this.vehicles().length > 0);

  // Computed: Separate bookings by status
  readonly activeBookings = computed(() =>
    this.bookings().filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status))
  );

  readonly completedBookings = computed(() =>
    this.bookings().filter((b) => ['completed', 'cancelled'].includes(b.status))
  );

  ngOnInit() {
    // Check for success query param
    this.route.queryParams.subscribe((params) => {
      if (params['booked'] === 'success') {
        this.successMessage.set(
          'Service booking created successfully! We will contact you to confirm.'
        );
        // Clear the query param
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
        // Clear success message after 5 seconds
        setTimeout(() => this.successMessage.set(null), 5000);
      }
    });

    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    // Load vehicles first
    this.vehiclesService.getMyVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
        this.loadBookings();
      },
      error: () => {
        this.error.set('Failed to load vehicles');
        this.loading.set(false);
      },
    });
  }

  loadBookings() {
    this.bookingsService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load service bookings');
        this.loading.set(false);
      },
    });
  }

  goToBookService() {
    this.router.navigate(['/account/service/book']);
  }

  openDetailsModal(booking: ServiceBooking) {
    this.selectedBooking.set(booking);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedBooking.set(null);
  }

  cancelBooking(booking: ServiceBooking) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.bookingsService.cancelBooking(booking.id).subscribe({
      next: () => {
        this.successMessage.set('Booking cancelled successfully');
        this.loadBookings();
        this.closeDetailsModal();

        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: () => {
        this.error.set('Failed to cancel booking');
      },
    });
  }

  // Helper methods for template
  getStatusLabel(status: string): string {
    return BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] || status;
  }

  getStatusColor(status: string): string {
    return BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS] || 'secondary';
  }

  getServiceTypeLabel(type: string): string {
    return SERVICE_TYPE_LABELS[type as keyof typeof SERVICE_TYPE_LABELS] || type;
  }

  getVehicleDisplay(booking: ServiceBooking): string {
    if (booking.vehicle) {
      return `${booking.vehicle.year} ${booking.vehicle.brand?.name || ''} ${booking.vehicle.name}`.trim();
    }
    const vehicle = this.vehicles().find((v) => v.id === booking.vehicleId);
    if (vehicle) {
      return `${vehicle.year} ${vehicle.brand?.name || ''} ${vehicle.name}`.trim();
    }
    return 'Unknown Vehicle';
  }

  canCancel(booking: ServiceBooking): boolean {
    return ['pending', 'confirmed'].includes(booking.status);
  }
}
