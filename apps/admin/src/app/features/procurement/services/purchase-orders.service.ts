import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrdersQuery,
  ReceiveItemsDto,
  RejectPurchaseOrderDto,
} from '../models';
import { PaginatedResult } from '../../../core/models/pagination.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/purchase-orders`;

  getPurchaseOrders(query: PurchaseOrdersQuery = {}): Observable<PaginatedResult<PurchaseOrder>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    if (query.branchId) params = params.set('branchId', query.branchId);
    if (query.supplierId) params = params.set('supplierId', query.supplierId);
    if (query.status) params = params.set('status', query.status);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResult<PurchaseOrder>>(this.apiUrl, { params });
  }

  getPurchaseOrder(id: string): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }

  createPurchaseOrder(data: CreatePurchaseOrderDto): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, data);
  }

  updatePurchaseOrder(id: string, data: UpdatePurchaseOrderDto): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}`, data);
  }

  deletePurchaseOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitForApproval(id: string): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/submit`, {});
  }

  approve(id: string): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: string, data: RejectPurchaseOrderDto): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/reject`, data);
  }

  cancel(id: string): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/cancel`, {});
  }

  receiveItems(id: string, data: ReceiveItemsDto): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/receive`, data);
  }

  exportPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  downloadPdf(id: string, filename: string): void {
    this.exportPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download PDF:', err);
      },
    });
  }
}
