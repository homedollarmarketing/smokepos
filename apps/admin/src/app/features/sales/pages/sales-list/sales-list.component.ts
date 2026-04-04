import { Component, OnInit, OnDestroy, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

import {
  SalesService,
  Sale,
  SalesQuery,
  getCustomerSourceLabel,
} from '../../services/sales.service';
import { PaginationMeta } from '../../../../core/models/pagination.model';
import { AuthService } from '../../../../core/services/auth.service';
import { BranchService } from '../../../../core/services/branch.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ChipModule,
    SelectModule,
    DatePickerModule,
    TooltipModule,
    TagModule,
    PageHeaderComponent,
  ],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.scss',
})
export class SalesListComponent implements OnInit, OnDestroy {
  private readonly salesService = inject(SalesService);
  private readonly branchService = inject(BranchService);
  private readonly router = inject(Router);
  public readonly authService = inject(AuthService);

  // State
  readonly sales = signal<Sale[]>([]);
  readonly pagination = signal<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Search
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Filters
  readonly statusOptions = [
    { label: 'Processing', value: 'processing' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  selectedStatus: string | undefined;
  selectedDateRange: Date[] | undefined;

  // Pagination Controls
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

  // Check if any filters are active
  readonly hasActiveFilters = computed(
    () => !!this.searchTerm || !!this.selectedStatus || !!this.selectedDateRange
  );

  // Track previous branch to detect changes
  private previousBranchId: string | null = null;

  constructor() {
    // React to branch changes
    effect(() => {
      const currentBranchId = this.branchService.currentBranchId();
      // Only reload if branch actually changed (not on initial load)
      if (this.previousBranchId !== null && currentBranchId !== this.previousBranchId) {
        this.loadSales(1);
      }
      this.previousBranchId = currentBranchId;
    });

    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadSales(1);
      });
  }

  ngOnInit() {
    this.loadSales();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSales(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    const query: SalesQuery = {
      page,
      limit: this.pagination().limit,
      search: this.searchTerm || undefined,
      status: this.selectedStatus,
      branchId: this.branchService.currentBranchId() || undefined,
    };

    if (this.selectedDateRange && this.selectedDateRange[0]) {
      query.startDate = this.selectedDateRange[0].toISOString();
      if (this.selectedDateRange[1]) {
        query.endDate = this.selectedDateRange[1].toISOString();
      }
    }

    this.salesService.getSales(query).subscribe({
      next: (res) => {
        this.sales.set(res.data);
        this.pagination.set(res.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load sales');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onFilterChange() {
    this.loadSales(1); // Reset to page 1
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = undefined;
    this.selectedDateRange = undefined;
    this.loadSales(1);
  }

  onCreate() {
    this.router.navigate(['/sales', 'new']);
  }

  onRowClick(event: { data?: Sale | Sale[] }) {
    if (event.data && !Array.isArray(event.data)) {
      this.router.navigate(['/sales', event.data.id]);
    }
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadSales(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadSales(this.pagination().page + 1);
    }
  }

  getSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'completed':
        return 'success';
      case 'delivered':
        return 'info';
      case 'processing':
        return 'warn';
      case 'cancelled':
        return 'danger';
      default:
        return undefined;
    }
  }

  getSourceLabel(source: string | undefined): string {
    return getCustomerSourceLabel(source as any);
  }
}
