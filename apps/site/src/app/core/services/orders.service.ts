import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  amountPaid: number;
  shippingAddress: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  items: OrderItem[];
  payments: OrderPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderPayment {
  id: string;
  amount: number;
  method: OrderPaymentMethod;
  status: OrderPaymentStatus;
  reference?: string;
  createdAt: string;
}

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
  shippingAddress: string;
  notes?: string;
}

export interface OrdersQuery {
  page: number;
  limit: number;
  status?: OrderStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedOrders {
  data: Order[];
  pagination: PaginationMeta;
}

export interface ShippingAddressResponse {
  shippingAddress: string | null;
}

export interface OrderStats {
  totalOrders: number;
  activeOrders: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/site/orders`;

  /**
   * Create a new order from cart
   */
  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, dto);
  }

  /**
   * Get customer's orders
   */
  getOrders(query: OrdersQuery): Observable<PaginatedOrders> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<PaginatedOrders>(this.apiUrl, { params });
  }

  /**
   * Get a specific order
   */
  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cancel an order
   */
  cancelOrder(id: string, reason: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  /**
   * Get order stats for dashboard
   */
  getStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Get saved shipping address
   */
  getSavedShippingAddress(): Observable<ShippingAddressResponse> {
    return this.http.get<ShippingAddressResponse>(`${this.apiUrl}/profile/shipping-address`);
  }

  /**
   * Helper: Calculate remaining balance
   */
  getBalance(order: Order): number {
    return order.totalAmount - order.amountPaid;
  }

  /**
   * Helper: Check if order can be cancelled
   */
  canCancel(order: Order): boolean {
    return order.status === 'pending' || order.status === 'confirmed';
  }
}
