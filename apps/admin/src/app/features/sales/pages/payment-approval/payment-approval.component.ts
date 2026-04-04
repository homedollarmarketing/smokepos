import { Component, OnInit, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { SalesService, SalePayment } from '../../services/sales.service';
import { BranchService } from '../../../../core/services/branch.service';
import { PaginationMeta } from '../../../../shared/models/pagination.model';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-payment-approval',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    PageHeaderComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './payment-approval.component.html',
  styleUrl: './payment-approval.component.scss',
})
export class PaymentApprovalComponent {
  private readonly salesService = inject(SalesService);
  private readonly branchService = inject(BranchService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  payments = signal<SalePayment[]>([]);
  pagination = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  isLoading = signal(false);

  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);
  readonly isEmpty = computed(() => this.payments().length === 0 && !this.isLoading());
  readonly totalPendingAmount = computed(() =>
    this.payments().reduce((sum, p) => sum + p.amount, 0)
  );

  constructor() {
    // React to branch changes
    effect(() => {
      const branchId = this.branchService.currentBranchId();
      if (branchId) {
        this.loadPendingPayments();
      }
    });
  }

  loadPendingPayments(page: number = 1) {
    this.isLoading.set(true);
    const branchId = this.branchService.currentBranchId();

    this.salesService
      .getPayments({
        page,
        limit: 20,
        status: 'pending',
        branchId: branchId || undefined,
      })
      .subscribe({
        next: (response) => {
          this.payments.set(response.data);
          this.pagination.set(response.pagination);
          this.isLoading.set(false);
        },
        error: () => {
          this.payments.set([]);
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load payments',
          });
        },
      });
  }

  onPrevPage() {
    if (this.canGoPrev()) {
      this.loadPendingPayments(this.pagination().page - 1);
    }
  }

  onNextPage() {
    if (this.canGoNext()) {
      this.loadPendingPayments(this.pagination().page + 1);
    }
  }

  processPayment(payment: SalePayment, status: 'confirmed' | 'denied') {
    this.confirmationService.confirm({
      message: `Are you sure you want to ${status} this payment?`,
      accept: () => {
        this.isLoading.set(true);
        this.salesService.approvePayment(payment.id, status).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Payment ${status}`,
            });
            this.loadPendingPayments(this.pagination().page); // Refresh current page
          },
          error: () => {
            this.isLoading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Action failed',
            });
          },
        });
      },
    });
  }
}
