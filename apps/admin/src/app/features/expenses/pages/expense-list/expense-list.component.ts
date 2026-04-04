import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ExpensesService } from '../../services/expenses.service';
import {
  Expense,
  ExpenseStatus,
  ExpenseCategory,
  EXPENSE_STATUS_LABELS,
  EXPENSE_STATUS_SEVERITY,
  EXPENSE_CATEGORY_LABELS,
} from '../../models/expense.model';
import { PaginationMeta, DEFAULT_LIMIT } from '../../../../shared/models/pagination.model';
import { BranchService } from '../../../../core/services/branch.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent,
    CurrencyPipe,
    DatePipe,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss',
})
export class ExpenseListComponent implements OnInit {
  private readonly expensesService = inject(ExpensesService);
  private readonly branchService = inject(BranchService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // State
  readonly expenses = signal<Expense[]>([]);
  readonly pagination = signal<PaginationMeta>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Filters (regular properties for ngModel binding)
  selectedStatus: ExpenseStatus | null = null;
  selectedCategory: ExpenseCategory | null = null;

  // Computed
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);
  readonly canCreate = computed(() => this.authService.hasPermission('expense.create'));
  readonly canEdit = computed(() => this.authService.hasPermission('expense.edit'));
  readonly canDelete = computed(() => this.authService.hasPermission('expense.delete'));
  readonly canApprove = computed(() => this.authService.hasPermission('expense.approve'));

  // Filter options
  readonly statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Pending', value: ExpenseStatus.PENDING },
    { label: 'Approved', value: ExpenseStatus.APPROVED },
    { label: 'Rejected', value: ExpenseStatus.REJECTED },
  ];

  readonly categoryOptions = [
    { label: 'All Categories', value: null },
    ...Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
      label,
      value: value as ExpenseCategory,
    })),
  ];

  // Track previous branch to detect changes
  private previousBranchId: string | null = null;

  constructor() {
    // React to branch changes
    effect(() => {
      const currentBranchId = this.branchService.currentBranchId();
      // Only reload if branch actually changed (not on initial load)
      if (this.previousBranchId !== null && currentBranchId !== this.previousBranchId) {
        this.loadExpenses(1);
      }
      this.previousBranchId = currentBranchId;
    });
  }

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses(page: number = 1) {
    this.isLoading.set(true);
    this.error.set(null);

    const branchId = this.branchService.currentBranchId();

    this.expensesService
      .getExpenses({
        page,
        limit: DEFAULT_LIMIT,
        branchId: branchId || undefined,
        status: this.selectedStatus || undefined,
        category: this.selectedCategory || undefined,
      })
      .subscribe({
        next: (data) => {
          this.expenses.set(data.data);
          this.pagination.set(data.pagination);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load expenses');
          this.isLoading.set(false);
        },
      });
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadExpenses(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadExpenses(this.pagination().page + 1);
    }
  }

  onCreate() {
    this.router.navigate(['/expenses', 'new']);
  }

  onRowClick(event: any) {
    const data = event.data as Expense;
    if (data && data.id) {
      this.router.navigate(['/expenses', data.id]);
    }
  }

  onEdit(expense: Expense, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/expenses', expense.id, 'edit']);
  }

  onDelete(expense: Expense, event: Event) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Are you sure you want to delete expense "${expense.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.expensesService.deleteExpense(expense.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Expense deleted successfully',
            });
            this.loadExpenses(this.pagination().page);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to delete expense',
            });
          },
        });
      },
    });
  }

  onFilterChange() {
    this.loadExpenses(1);
  }

  getStatusLabel(status: ExpenseStatus): string {
    return EXPENSE_STATUS_LABELS[status];
  }

  getStatusSeverity(status: ExpenseStatus): 'warn' | 'success' | 'danger' {
    return EXPENSE_STATUS_SEVERITY[status];
  }

  getCategoryLabel(category: ExpenseCategory): string {
    return EXPENSE_CATEGORY_LABELS[category];
  }

  isPending(expense: Expense): boolean {
    return expense.status === ExpenseStatus.PENDING;
  }

  getCreatedByName(expense: Expense): string {
    if (expense.createdBy) {
      return `${expense.createdBy.firstName} ${expense.createdBy.lastName}`;
    }
    return 'Unknown';
  }
}
