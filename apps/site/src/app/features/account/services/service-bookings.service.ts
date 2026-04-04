import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ServiceBooking, CreateServiceBookingDto } from '../models/service-booking.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceBookingsService {
  private readonly apiUrl = `${environment.apiUrl}/customers/me/service-bookings`;
  private readonly http = inject(HttpClient);

  /**
   * Get all service bookings for the current customer
   */
  getMyBookings(): Observable<ServiceBooking[]> {
    return this.http.get<ServiceBooking[]>(this.apiUrl);
  }

  /**
   * Get a single service booking by ID
   */
  getBooking(id: string): Observable<ServiceBooking> {
    return this.http.get<ServiceBooking>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new service booking
   */
  createBooking(data: CreateServiceBookingDto): Observable<ServiceBooking> {
    return this.http.post<ServiceBooking>(this.apiUrl, data);
  }

  /**
   * Cancel a service booking
   */
  cancelBooking(id: string): Observable<ServiceBooking> {
    return this.http.patch<ServiceBooking>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
