import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  OrdersService,
  Order,
  OrderStatus,
  OrderPaymentStatus,
} from '../../../../core/services/orders.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);

  // State
  readonly order = signal<Order | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showSuccess = signal(false);

  // Cancel dialog
  readonly showCancelDialog = signal(false);
  readonly cancelReason = signal('');
  readonly isCancelling = signal(false);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.router.navigate(['/account/orders']);
      return;
    }

    // Check if redirected after successful order
    if (this.route.snapshot.queryParamMap.get('success') === 'true') {
      this.showSuccess.set(true);
    }

    this.loadOrder(orderId);
  }

  private loadOrder(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.ordersService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Order not found');
        } else {
          this.error.set(err.error?.message || 'Failed to load order');
        }
        this.isLoading.set(false);
      },
    });
  }

  get canCancel(): boolean {
    const order = this.order();
    return order ? this.ordersService.canCancel(order) : false;
  }

  get balance(): number {
    const order = this.order();
    return order ? this.ordersService.getBalance(order) : 0;
  }

  openCancelDialog(): void {
    this.cancelReason.set('');
    this.showCancelDialog.set(true);
  }

  closeCancelDialog(): void {
    this.showCancelDialog.set(false);
  }

  onReasonChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.cancelReason.set(value);
  }

  confirmCancel(): void {
    const order = this.order();
    if (!order || this.isCancelling()) return;

    this.isCancelling.set(true);

    this.ordersService.cancelOrder(order.id, this.cancelReason()).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.showCancelDialog.set(false);
        this.isCancelling.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to cancel order');
        this.isCancelling.set(false);
      },
    });
  }

  dismissSuccess(): void {
    this.showSuccess.set(false);
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

  getPaymentStatusClass(status: OrderPaymentStatus): string {
    const classes: Record<OrderPaymentStatus, string> = {
      pending: 'payment-pending',
      confirmed: 'payment-confirmed',
      denied: 'payment-denied',
    };
    return classes[status] || '';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      mobile_money: 'Mobile Money',
      other: 'Other',
    };
    return labels[method] || method;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
