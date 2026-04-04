import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../models/customer.model';
import { PaginationMeta, DEFAULT_LIMIT } from '../../../../shared/models/pagination.model';
import { BranchService } from '../../../../core/services/branch.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TagModule, PageHeaderComponent],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  private readonly customersService = inject(CustomersService);
  private readonly branchService = inject(BranchService);
  private readonly router = inject(Router);

  // State
  readonly customers = signal<Customer[]>([]);
  readonly pagination = signal<PaginationMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Computed
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

  // Track previous branch to detect changes
  private previousBranchId: string | null = null;

  constructor() {
    // React to branch changes
    effect(() => {
      const currentBranchId = this.branchService.currentBranchId();
      // Only reload if branch actually changed (not on initial load)
      if (this.previousBranchId !== null && currentBranchId !== this.previousBranchId) {
        this.loadCustomers(1);
      }
      this.previousBranchId = currentBranchId;
    });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    const branchId = this.branchService.currentBranchId();

    this.customersService
      .getCustomers({
        page,
        limit: DEFAULT_LIMIT,
        branchId: branchId || undefined,
      })
      .subscribe({
        next: (data) => {
          this.customers.set(data.data);
          this.pagination.set(data.pagination);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load customers');
          this.isLoading.set(false);
        },
      });
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadCustomers(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadCustomers(this.pagination().page + 1);
    }
  }

  onRowClick(event: any) {
    const data = event.data as Customer;
    if (data && data.id) {
      this.router.navigate(['/customers', data.id]);
    }
  }

  onCreate() {
    this.router.navigate(['/customers', 'new']);
  }
}
