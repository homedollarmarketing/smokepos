import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import {
  SalesService,
  Sale,
  SalePayment,
  RecordPaymentDto,
  getCustomerSourceLabel,
} from '../../services/sales.service';
import { AuthService } from '../../../../core/services/auth.service';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-sale-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    ToastModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    InputTextModule,
    FormsModule,
    TooltipModule,
    ConfirmDialogModule,
    PageHeaderComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sale-details.component.html',
  styleUrl: './sale-details.component.scss',
})
export class SaleDetailsComponent implements OnInit {
  private readonly salesService = inject(SalesService);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  public readonly authService = inject(AuthService);

  sale = signal<Sale | null>(null);
  isLoading = signal(false);

  // Computed profit data
  totalCost = computed(() => {
    const s = this.sale();
    if (!s) return null;
    const items = s.items.filter(i => i.unitCost !== null && i.unitCost !== undefined);
    if (items.length === 0) return null;
    return items.reduce((sum, i) => sum + (i.unitCost! * i.quantity), 0);
  });

  grossProfit = computed(() => {
    const cost = this.totalCost();
    const s = this.sale();
    if (cost === null || !s) return null;
    return s.subtotal - cost;
  });

  grossProfitMargin = computed(() => {
    const profit = this.grossProfit();
    const s = this.sale();
    if (profit === null || !s || s.subtotal === 0) return null;
    return (profit / s.subtotal) * 100;
  });

  // Payment Dialog
  showPaymentDialog = false;
  paymentAmount: number | null = null;
  paymentMethod = 'cash';
  paymentReference = '';
  isRecordingPayment = false;

  paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Mobile Money', value: 'mobile_money' },
    { label: 'Card', value: 'card' },
    { label: 'Other', value: 'other' },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadSale(id);
      }
    });
  }

  loadSale(id: string) {
    this.isLoading.set(true);
    this.salesService.getSale(id).subscribe({
      next: (data) => {
        this.sale.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'success';
      case 'delivered':
        return 'info';
      case 'processing':
        return 'warn';
      case 'pending':
        return 'warn';
      case 'cancelled':
        return 'danger';
      case 'denied':
        return 'danger';
      default:
        return undefined;
    }
  }

  // Actions
  updateStatus(status: string) {
    const sale = this.sale();
    if (!sale) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to mark this sale as ${status}?`,
      accept: () => {
        this.isLoading.set(true);
        this.salesService.updateStatus(sale.id, status).subscribe({
          next: (updatedSale) => {
            this.sale.set(updatedSale);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Sale marked as ${status}`,
            });
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.message || 'Update failed',
            });
          },
        });
      },
    });
  }

  // Payment Logic
  openPaymentDialog() {
    if (!this.sale()) return;
    this.paymentAmount = this.sale()!.balance; // Default to remaining balance
    this.paymentMethod = 'cash';
    this.paymentReference = '';
    this.showPaymentDialog = true;
  }

  submitPayment() {
    if (!this.paymentAmount || this.paymentAmount <= 0) return;

    const sale = this.sale();
    if (!sale) return;

    this.isRecordingPayment = true;
    const dto: RecordPaymentDto = {
      amount: this.paymentAmount,
      method: this.paymentMethod,
      reference: this.paymentReference,
    };

    this.salesService.recordPayment(sale.id, dto).subscribe({
      next: () => {
        this.isRecordingPayment = false;
        this.showPaymentDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment recorded successfully',
        });
        this.loadSale(sale.id); // Reload to see new balance/history
      },
      error: () => {
        this.isRecordingPayment = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to record payment',
        });
      },
    });
  }

  // PDF loading states
  isGeneratingInvoice = false;
  isEmailingInvoice = false;
  generatingReceiptId: string | null = null;
  emailingReceiptId: string | null = null;

  // Download Invoice PDF
  downloadInvoice() {
    const sale = this.sale();
    if (!sale) return;

    this.isGeneratingInvoice = true;
    this.salesService.downloadInvoice(sale.id).subscribe({
      next: (blob) => {
        this.isGeneratingInvoice = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filePrefix = sale.status === 'completed' ? 'receipt' : 'invoice';
        a.download = `${filePrefix}-${sale.saleId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.isGeneratingInvoice = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate invoice',
        });
      },
    });
  }

  // Email Invoice to customer
  emailInvoice() {
    const sale = this.sale();
    if (!sale) return;

    if (!sale.customer?.email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Customer does not have an email address',
      });
      return;
    }

    this.isEmailingInvoice = true;
    this.salesService.emailInvoice(sale.id).subscribe({
      next: () => {
        this.isEmailingInvoice = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Invoice sent to customer',
        });
      },
      error: () => {
        this.isEmailingInvoice = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send invoice',
        });
      },
    });
  }

  // Download Receipt PDF for a confirmed payment
  downloadReceipt(payment: SalePayment) {
    this.generatingReceiptId = payment.id;
    this.salesService.downloadReceipt(payment.id).subscribe({
      next: (blob) => {
        this.generatingReceiptId = null;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${payment.id.substring(0, 8).toUpperCase()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.generatingReceiptId = null;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate receipt',
        });
      },
    });
  }

  // Email Receipt to customer
  emailReceipt(payment: SalePayment) {
    const sale = this.sale();
    if (!sale?.customer?.email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Customer does not have an email address',
      });
      return;
    }

    this.emailingReceiptId = payment.id;
    this.salesService.emailReceipt(payment.id).subscribe({
      next: () => {
        this.emailingReceiptId = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Receipt sent to customer',
        });
      },
      error: () => {
        this.emailingReceiptId = null;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send receipt',
        });
      },
    });
  }

  // Helper to check if invoice actions are available
  canGenerateInvoice(): boolean {
    const sale = this.sale();
    if (!sale) return false;
    return ['processing', 'delivered', 'completed'].includes(sale.status);
  }

  // Helper to get customer source label
  getSourceLabel(source: string | undefined): string {
    return getCustomerSourceLabel(source as any);
  }
}
