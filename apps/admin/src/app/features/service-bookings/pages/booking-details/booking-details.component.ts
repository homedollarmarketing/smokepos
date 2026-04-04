import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

import { ServiceBookingsService } from '../../services/service-bookings.service';
import {
  ServiceBooking,
  BookingStatus,
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from '../../models/service-booking.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    CardModule,
    DividerModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss',
})
export class BookingDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ServiceBookingsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  // State
  readonly booking = signal<ServiceBooking | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isUpdatingStatus = signal(false);

  // Permissions
  readonly canEdit = computed(() => this.authService.hasPermission('serviceBooking.edit'));
  readonly canDelete = computed(() => this.authService.hasPermission('serviceBooking.delete'));

  // Status options for quick update
  readonly statusOptions = Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBooking(id);
    } else {
      this.router.navigate(['/service-bookings']);
    }
  }

  loadBooking(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.service.getBookingById(id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load booking');
        this.isLoading.set(false);
      },
    });
  }

  onStatusChange(newStatus: BookingStatus) {
    const booking = this.booking();
    if (!booking) return;

    this.isUpdatingStatus.set(true);
    this.service.updateBooking(booking.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.booking.set(updated);
        this.isUpdatingStatus.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Status updated successfully',
        });
      },
      error: (err) => {
        this.isUpdatingStatus.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to update status',
        });
      },
    });
  }

  editBooking() {
    const booking = this.booking();
    if (booking) {
      this.router.navigate(['/service-bookings', booking.id, 'edit']);
    }
  }

  deleteBooking() {
    const booking = this.booking();
    if (!booking) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this booking?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.deleteBooking(booking.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Booking deleted successfully',
            });
            this.router.navigate(['/service-bookings']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to delete booking',
            });
          },
        });
      },
    });
  }

  goBack() {
    this.router.navigate(['/service-bookings']);
  }

  getServiceTypeLabel(type: string): string {
    return SERVICE_TYPE_LABELS[type as keyof typeof SERVICE_TYPE_LABELS] || type;
  }

  getStatusLabel(status: BookingStatus): string {
    return BOOKING_STATUS_LABELS[status] || status;
  }

  getStatusSeverity(
    status: BookingStatus
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return BOOKING_STATUS_COLORS[status] || 'info';
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  }

  getCustomerName(): string {
    const booking = this.booking();
    if (!booking?.customer) return 'Unknown Customer';
    return booking.customer.name;
  }

  getVehicleInfo(): string {
    const booking = this.booking();
    if (!booking?.vehicle) return 'No Vehicle';
    const v = booking.vehicle;
    return `${v.year} ${v.name}`;
  }
}
