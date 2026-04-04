import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginationQuery, PaginatedResult } from '../../../core/models/pagination.model';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type OrderPaymentStatus = 'pending' | 'confirmed' | 'denied';
export type OrderPaymentMethod = 'bank_transfer' | 'mobile_money' | 'other';

export interface Order {
  id: string;
  orderId: string;
  customer?: { id: string; name: string; email: string; phoneNumber: string };
  branch?: { id: string; name: string };
  status: OrderStatus;
  totalAmount: number;
  amountPaid: number;
  shippingAddress: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: { id: string; email: string };
  items: OrderItem[];
  payments: OrderPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product?: { id: string; name: string; sku: string };
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderPayment {
  id: string;
  orderId: string;
  amount: number;
  method: OrderPaymentMethod;
  status: OrderPaymentStatus;
  reference?: string;
  notes?: string;
  createdAt: string;
  confirmedBy?: { id: string; firstName: string; lastName: string };
  confirmedAt?: string;
}

export interface OrdersQuery extends PaginationQuery {
  search?: string;
  status?: OrderStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface RecordOrderPaymentDto {
  amount: number;
  method: OrderPaymentMethod;
  reference?: string;
  notes?: string;
}

export interface CancelOrderDto {
  reason: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  getOrders(query: OrdersQuery): Observable<PaginatedResult<Order>> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());

    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.customerId) params = params.set('customerId', query.customerId);
    if (query.startDate) params = params.set('startDate', query.startDate);
    if (query.endDate) params = params.set('endDate', query.endDate);

    return this.http.get<PaginatedResult<Order>>(this.apiUrl, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelOrder(id: string, reason: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  recordPayment(orderId: string, data: RecordOrderPaymentDto): Observable<OrderPayment> {
    return this.http.post<OrderPayment>(`${this.apiUrl}/${orderId}/payments`, data);
  }

  confirmPayment(orderId: string, paymentId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/payments/${paymentId}/confirm`, {});
  }

  denyPayment(orderId: string, paymentId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/payments/${paymentId}/deny`, {});
  }
}
