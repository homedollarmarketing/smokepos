import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginatedResponse, PaginationQuery } from '../../../shared/models/pagination.model';
import {
  Customer,
  Vehicle,
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateVehicleDto,
  UpdateVehicleDto,
} from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly apiUrl = `${environment.apiUrl}/customers`;
  private readonly http = inject(HttpClient);

  // ========== Customer Methods ==========

  /**
   * Get paginated list of customers
   */
  getCustomers(
    query: PaginationQuery & { branchId?: string }
  ): Observable<PaginatedResponse<Customer>> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.branchId) {
      params = params.set('branchId', query.branchId);
    }

    return this.http.get<PaginatedResponse<Customer>>(this.apiUrl, { params });
  }

  /**
   * Get single customer by ID
   */
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new customer
   */
  createCustomer(data: CreateCustomerDto, branchId?: string): Observable<Customer> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.post<Customer>(this.apiUrl, data, { params });
  }

  /**
   * Update an existing customer
   */
  updateCustomer(id: string, data: UpdateCustomerDto): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== Vehicle Methods ==========

  /**
   * Get all vehicles for a customer
   */
  getVehicles(customerId: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/${customerId}/vehicles`);
  }

  /**
   * Search customers by name, email, or phone for autocomplete
   */
  searchCustomers(query: string, limit: number = 10, branchId?: string): Observable<Customer[]> {
    let params = new HttpParams().set('q', query).set('limit', limit.toString());

    if (branchId) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<Customer[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Create a new vehicle for a customer
   */
  createVehicle(customerId: string, data: CreateVehicleDto): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/${customerId}/vehicles`, data);
  }

  /**
   * Update an existing vehicle
   */
  updateVehicle(
    customerId: string,
    vehicleId: string,
    data: UpdateVehicleDto
  ): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.apiUrl}/${customerId}/vehicles/${vehicleId}`, data);
  }

  /**
   * Delete a vehicle
   */
  deleteVehicle(customerId: string, vehicleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${customerId}/vehicles/${vehicleId}`);
  }
}
