import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import {
  ServiceBooking,
  AdminCreateServiceBookingDto,
  UpdateServiceBookingDto,
  ServiceBookingQueryDto,
} from '../models/service-booking.model';
import { BranchService } from '../../../core/services/branch.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceBookingsService {
  private readonly apiUrl = `${environment.apiUrl}/service-bookings`;
  private readonly http = inject(HttpClient);
  private readonly branchService = inject(BranchService);

  private get branchId(): string {
    return this.branchService.currentBranchId() || '';
  }

  /**
   * Get paginated list of service bookings
   */
  getBookings(query: ServiceBookingQueryDto = {}): Observable<PaginatedResponse<ServiceBooking>> {
    let params = new HttpParams().set('branchId', this.branchId);

    if (query.page) {
      params = params.set('page', query.page.toString());
    }
    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.serviceType) {
      params = params.set('serviceType', query.serviceType);
    }
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.customerId) {
      params = params.set('customerId', query.customerId);
    }

    return this.http.get<PaginatedResponse<ServiceBooking>>(this.apiUrl, { params });
  }

  /**
   * Get a single service booking by ID
   */
  getBookingById(id: string): Observable<ServiceBooking> {
    const params = new HttpParams().set('branchId', this.branchId);
    return this.http.get<ServiceBooking>(`${this.apiUrl}/${id}`, { params });
  }

  /**
   * Create a new service booking
   */
  createBooking(data: AdminCreateServiceBookingDto): Observable<ServiceBooking> {
    const params = new HttpParams().set('branchId', this.branchId);
    return this.http.post<ServiceBooking>(this.apiUrl, data, { params });
  }

  /**
   * Update a service booking
   */
  updateBooking(id: string, data: UpdateServiceBookingDto): Observable<ServiceBooking> {
    const params = new HttpParams().set('branchId', this.branchId);
    return this.http.patch<ServiceBooking>(`${this.apiUrl}/${id}`, data, { params });
  }

  /**
   * Delete a service booking
   */
  deleteBooking(id: string): Observable<void> {
    const params = new HttpParams().set('branchId', this.branchId);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  /**
   * Get stats for badge (pending bookings count)
   */
  getStats(): Observable<{ pending: number }> {
    const params = new HttpParams().set('branchId', this.branchId);
    return this.http.get<{ pending: number }>(`${this.apiUrl}/stats`, { params });
  }
}
