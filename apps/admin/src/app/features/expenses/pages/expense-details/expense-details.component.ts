import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ExpensesService } from '../../services/expenses.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  Expense,
  ExpenseStatus,
  EXPENSE_STATUS_LABELS,
  EXPENSE_STATUS_SEVERITY,
  EXPENSE_CATEGORY_LABELS,
} from '../../models/expense.model';

@Component({
  selector: 'app-expense-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    CardModule,
    DialogModule,
    TextareaModule,
    RadioButtonModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent,
    CurrencyPipe,
    DatePipe,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './expense-details.component.html',
  styleUrl: './expense-details.component.scss',
})
export class ExpenseDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly expensesService = inject(ExpensesService);
  private readonly authService = inject(AuthService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // State
  readonly expense = signal<Expense | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Review dialog state
  readonly showReviewDialog = signal(false);
  readonly reviewStatus = signal<ExpenseStatus.APPROVED | ExpenseStatus.REJECTED>(
    ExpenseStatus.APPROVED
  );
  readonly rejectionReason = signal('');
  readonly isReviewing = signal(false);

  // Permissions
  readonly canEdit = computed(() => this.authService.hasPermission('expense.edit'));
  readonly canDelete = computed(() => this.authService.hasPermission('expense.delete'));
  readonly canApprove = computed(() => this.authService.hasPermission('expense.approve'));

  // Computed
  readonly isPending = computed(() => this.expense()?.status === ExpenseStatus.PENDING);
  readonly canReview = computed(() => this.canApprove() && this.isPending());
  readonly canModify = computed(() => this.isPending());

  // Status options for review
  readonly ExpenseStatus = ExpenseStatus;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExpense(id);
    }
  }

  loadExpense(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.expensesService.getExpenseById(id).subscribe({
      next: (expense) => {
        this.expense.set(expense);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load expense');
        this.isLoading.set(false);
      },
    });
  }

  onEdit() {
    const expense = this.expense();
    if (expense) {
      this.router.navigate(['/expenses', expense.id, 'edit']);
    }
  }

  onDelete() {
    const expense = this.expense();
    if (!expense) return;

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
            this.router.navigate(['/expenses']);
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

  openReviewDialog() {
    this.reviewStatus.set(ExpenseStatus.APPROVED);
    this.rejectionReason.set('');
    this.showReviewDialog.set(true);
  }

  closeReviewDialog() {
    this.showReviewDialog.set(false);
  }

  onReviewSubmit() {
    const expense = this.expense();
    if (!expense) return;

    // Validate rejection reason if rejecting
    if (this.reviewStatus() === ExpenseStatus.REJECTED && !this.rejectionReason().trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please provide a reason for rejection',
      });
      return;
    }

    this.isReviewing.set(true);

    this.expensesService
      .reviewExpense(expense.id, {
        status: this.reviewStatus(),
        rejectionReason:
          this.reviewStatus() === ExpenseStatus.REJECTED ? this.rejectionReason() : undefined,
      })
      .subscribe({
        next: (updatedExpense) => {
          this.expense.set(updatedExpense);
          this.showReviewDialog.set(false);
          this.isReviewing.set(false);

          const action = this.reviewStatus() === ExpenseStatus.APPROVED ? 'approved' : 'rejected';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Expense ${action} successfully`,
          });
        },
        error: (err) => {
          this.isReviewing.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to review expense',
          });
        },
      });
  }

  getStatusLabel(status: ExpenseStatus): string {
    return EXPENSE_STATUS_LABELS[status];
  }

  getStatusSeverity(status: ExpenseStatus): 'warn' | 'success' | 'danger' {
    return EXPENSE_STATUS_SEVERITY[status];
  }

  getCategoryLabel(category: string): string {
    return EXPENSE_CATEGORY_LABELS[category as keyof typeof EXPENSE_CATEGORY_LABELS] || category;
  }

  getCreatedByName(): string {
    const expense = this.expense();
    if (expense?.createdBy) {
      return `${expense.createdBy.firstName} ${expense.createdBy.lastName}`;
    }
    return 'Unknown';
  }

  getReviewedByName(): string {
    const expense = this.expense();
    if (expense?.reviewedBy) {
      return `${expense.reviewedBy.firstName} ${expense.reviewedBy.lastName}`;
    }
    return 'N/A';
  }

  getTaggedStaffName(): string {
    const expense = this.expense();
    if (expense?.staff) {
      return `${expense.staff.firstName} ${expense.staff.lastName}`;
    }
    return 'N/A';
  }

  goBack() {
    this.router.navigate(['/expenses']);
  }
}
