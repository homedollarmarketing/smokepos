import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';

import { OrdersService, Order, OrdersQuery, OrderStatus } from '../../services/orders.service';
import { PaginationMeta } from '../../../../core/models/pagination.model';
import { AuthService } from '../../../../core/services/auth.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    PageHeaderComponent,
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent implements OnInit, OnDestroy {
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);
  public readonly authService = inject(AuthService);

  // State
  readonly orders = signal<Order[]>([]);
  readonly pagination = signal<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Search
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Filters
  readonly statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  selectedStatus: OrderStatus | undefined;
  selectedDateRange: Date[] | undefined;

  // Pagination Controls
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

  // Check if any filters are active
  readonly hasActiveFilters = computed(
    () => !!this.searchTerm || !!this.selectedStatus || !!this.selectedDateRange
  );

  constructor() {
    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadOrders(1);
      });
  }

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    const query: OrdersQuery = {
      page,
      limit: this.pagination().limit,
      search: this.searchTerm || undefined,
      status: this.selectedStatus,
    };

    if (this.selectedDateRange && this.selectedDateRange.length === 2) {
      query.startDate = this.selectedDateRange[0].toISOString();
      query.endDate = this.selectedDateRange[1].toISOString();
    }

    this.ordersService.getOrders(query).subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load orders');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onFilterChange() {
    this.loadOrders(1);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = undefined;
    this.selectedDateRange = undefined;
    this.loadOrders(1);
  }

  onRowClick(event: any) {
    const order = event.data as Order;
    this.router.navigate(['/orders', order.id]);
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadOrders(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadOrders(this.pagination().page + 1);
    }
  }

  getSeverity(
    status: OrderStatus
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'confirmed':
        return 'info';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getBalance(order: Order): number {
    return order.totalAmount - order.amountPaid;
  }
}
