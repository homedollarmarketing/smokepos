import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ServiceBookingsService } from '../../services/service-bookings.service';
import {
  ServiceBooking,
  BookingStatus,
  ServiceType,
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from '../../models/service-booking.model';
import { AuthService } from '../../../../core/services/auth.service';
import { BranchService } from '../../../../core/services/branch.service';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    SelectModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './bookings-list.component.html',
  styleUrl: './bookings-list.component.scss',
})
export class BookingsListComponent implements OnInit {
  private readonly service = inject(ServiceBookingsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly branchService = inject(BranchService);

  // State
  readonly bookings = signal<ServiceBooking[]>([]);
  readonly pagination = signal<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Filters
  readonly statusFilter = signal<BookingStatus | ''>('');
  readonly serviceTypeFilter = signal<ServiceType | ''>('');
  readonly searchQuery = signal('');

  // Computed
  readonly isEmpty = computed(() => this.bookings().length === 0 && !this.isLoading());
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

  // Permissions
  readonly canCreate = computed(() => this.authService.hasPermission('serviceBooking.create'));

  // Track previous branch to detect changes
  private previousBranchId: string | null = null;

  // Filter options
  readonly statusOptions = [
    { label: 'All Statuses', value: '' },
    ...Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({
      label,
      value,
    })),
  ];

  readonly serviceTypeOptions = [
    { label: 'All Service Types', value: '' },
    ...Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({
      label,
      value,
    })),
  ];

  constructor() {
    // React to branch changes
    effect(() => {
      const currentBranchId = this.branchService.currentBranchId();
      // Only reload if branch actually changed (not on initial load)
      if (this.previousBranchId !== null && currentBranchId !== this.previousBranchId) {
        this.loadBookings(1);
      }
      this.previousBranchId = currentBranchId;
    });
  }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    const query: any = {
      page,
      limit: this.pagination().limit,
    };

    if (this.statusFilter()) {
      query.status = this.statusFilter();
    }
    if (this.serviceTypeFilter()) {
      query.serviceType = this.serviceTypeFilter();
    }
    if (this.searchQuery()) {
      query.search = this.searchQuery();
    }

    this.service.getBookings(query).subscribe({
      next: (response) => {
        this.bookings.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load bookings');
        this.isLoading.set(false);
      },
    });
  }

  onFilterChange() {
    this.loadBookings(1);
  }

  onSearch() {
    this.loadBookings(1);
  }

  clearFilters() {
    this.statusFilter.set('');
    this.serviceTypeFilter.set('');
    this.searchQuery.set('');
    this.loadBookings(1);
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadBookings(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadBookings(this.pagination().page + 1);
    }
  }

  onRowClick(event: any) {
    const booking = event.data as ServiceBooking;
    if (booking?.id) {
      this.router.navigate(['/service-bookings', booking.id]);
    }
  }

  getServiceTypeLabel(type: ServiceType): string {
    return SERVICE_TYPE_LABELS[type] || type;
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
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(time: string | null): string {
    if (!time) return '';
    return time;
  }

  formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  }

  getCustomerName(booking: ServiceBooking): string {
    if (!booking.customer) return 'Unknown Customer';
    return booking.customer.name;
  }

  getVehicleInfo(booking: ServiceBooking): string {
    if (!booking.vehicle) return 'No Vehicle';
    const v = booking.vehicle;
    return `${v.year} ${v.name}`;
  }
}
