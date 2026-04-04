import { Component, OnInit, signal, inject } from '@angular/core';
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
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import {
  OrdersService,
  Order,
  OrderStatus,
  OrderPayment,
  RecordOrderPaymentDto,
  OrderPaymentMethod,
} from '../../services/orders.service';
import { AuthService } from '../../../../core/services/auth.service';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-order-details',
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
    TextareaModule,
    FormsModule,
    TooltipModule,
    ConfirmDialogModule,
    PageHeaderComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  public readonly authService = inject(AuthService);

  order = signal<Order | null>(null);
  isLoading = signal(false);

  // Payment Dialog
  showPaymentDialog = false;
  paymentAmount: number | null = null;
  paymentMethod: OrderPaymentMethod = 'bank_transfer';
  paymentReference = '';
  paymentNotes = '';
  isRecordingPayment = false;

  // Cancel Dialog
  showCancelDialog = false;
  cancelReason = '';
  isCancelling = false;

  paymentMethods = [
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Mobile Money', value: 'mobile_money' },
    { label: 'Other', value: 'other' },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadOrder(id);
      }
    });
  }

  loadOrder(id: string) {
    this.isLoading.set(true);
    this.ordersService.getOrder(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'confirmed':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'info';
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

  getBalance(): number {
    const order = this.order();
    if (!order) return 0;
    return order.totalAmount - order.amountPaid;
  }

  canConfirm(): boolean {
    const order = this.order();
    return order?.status === 'pending';
  }

  canProcess(): boolean {
    const order = this.order();
    return order?.status === 'confirmed';
  }

  canShip(): boolean {
    const order = this.order();
    return order?.status === 'processing';
  }

  canDeliver(): boolean {
    const order = this.order();
    return order?.status === 'shipped';
  }

  canCancel(): boolean {
    const order = this.order();
    return order?.status === 'pending' || order?.status === 'confirmed';
  }

  getPaymentIcon(method: string): string {
    const icons: Record<string, string> = {
      bank_transfer: 'pi pi-building',
      mobile_money: 'pi pi-mobile',
      other: 'pi pi-wallet',
    };
    return icons[method] || 'pi pi-wallet';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      mobile_money: 'Mobile Money',
      other: 'Other',
    };
    return labels[method] || method;
  }

  // Actions
  updateStatus(status: OrderStatus) {
    const order = this.order();
    if (!order) return;

    const statusLabels: Record<OrderStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    this.confirmationService.confirm({
      message: `Are you sure you want to mark this order as ${statusLabels[status]}?`,
      accept: () => {
        this.isLoading.set(true);
        this.ordersService.updateStatus(order.id, status).subscribe({
          next: (updatedOrder) => {
            this.order.set(updatedOrder);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Order marked as ${statusLabels[status]}`,
            });
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Update failed',
            });
          },
        });
      },
    });
  }

  // Cancel Logic
  openCancelDialog() {
    this.cancelReason = '';
    this.showCancelDialog = true;
  }

  submitCancel() {
    if (!this.cancelReason || this.cancelReason.length < 10) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Cancellation reason must be at least 10 characters',
      });
      return;
    }

    const order = this.order();
    if (!order) return;

    this.isCancelling = true;
    this.ordersService.cancelOrder(order.id, this.cancelReason).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.isCancelling = false;
        this.showCancelDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Order cancelled successfully',
        });
      },
      error: (err) => {
        this.isCancelling = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to cancel order',
        });
      },
    });
  }

  // Payment Logic
  openPaymentDialog() {
    if (!this.order()) return;
    this.paymentAmount = this.getBalance();
    this.paymentMethod = 'bank_transfer';
    this.paymentReference = '';
    this.paymentNotes = '';
    this.showPaymentDialog = true;
  }

  submitPayment() {
    if (!this.paymentAmount || this.paymentAmount <= 0) return;

    const order = this.order();
    if (!order) return;

    this.isRecordingPayment = true;
    const dto: RecordOrderPaymentDto = {
      amount: this.paymentAmount,
      method: this.paymentMethod,
      reference: this.paymentReference || undefined,
      notes: this.paymentNotes || undefined,
    };

    this.ordersService.recordPayment(order.id, dto).subscribe({
      next: () => {
        this.isRecordingPayment = false;
        this.showPaymentDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment recorded successfully',
        });
        this.loadOrder(order.id);
      },
      error: (err) => {
        this.isRecordingPayment = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to record payment',
        });
      },
    });
  }

  // Confirm/Deny Payment
  confirmPayment(payment: OrderPayment) {
    const order = this.order();
    if (!order) return;

    this.confirmationService.confirm({
      message: `Confirm payment of ${payment.amount.toLocaleString()} UGX?`,
      accept: () => {
        this.ordersService.confirmPayment(order.id, payment.id).subscribe({
          next: (updatedOrder) => {
            this.order.set(updatedOrder);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Payment confirmed',
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to confirm payment',
            });
          },
        });
      },
    });
  }

  denyPayment(payment: OrderPayment) {
    const order = this.order();
    if (!order) return;

    this.confirmationService.confirm({
      message: `Deny payment of ${payment.amount.toLocaleString()} UGX?`,
      accept: () => {
        this.ordersService.denyPayment(order.id, payment.id).subscribe({
          next: (updatedOrder) => {
            this.order.set(updatedOrder);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Payment denied',
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to deny payment',
            });
          },
        });
      },
    });
  }
}
