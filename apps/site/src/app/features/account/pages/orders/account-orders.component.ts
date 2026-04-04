import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  OrdersService,
  Order,
  OrderStatus,
  PaginationMeta,
} from '../../../../core/services/orders.service';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-orders.component.html',
  styleUrl: './account-orders.component.scss',
})
export class AccountOrdersComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);

  // State
  readonly orders = signal<Order[]>([]);
  readonly pagination = signal<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentStatus = signal<OrderStatus | undefined>(undefined);

  // Computed
  readonly isEmpty = computed(() => this.orders().length === 0 && !this.isLoading());
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

  // Status options for filtering
  readonly statusOptions: { value: OrderStatus | undefined; label: string }[] = [
    { value: undefined, label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page = 1): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.ordersService
      .getOrders({
        page,
        limit: 10,
        status: this.currentStatus(),
      })
      .subscribe({
        next: (response) => {
          this.orders.set(response.data);
          this.pagination.set(response.pagination);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load orders');
          this.isLoading.set(false);
        },
      });
  }

  onStatusChange(status: OrderStatus | undefined): void {
    this.currentStatus.set(status);
    this.loadOrders(1);
  }

  onPrevPage(): void {
    if (this.canGoPrev()) {
      this.loadOrders(this.pagination().page - 1);
    }
  }

  onNextPage(): void {
    if (this.canGoNext()) {
      this.loadOrders(this.pagination().page + 1);
    }
  }

  getStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return classes[status] || '';
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
