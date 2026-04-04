import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Supplier, CreateSupplierDto, UpdateSupplierDto, SuppliersQuery } from '../models';
import { PaginatedResult } from '../../../core/models/pagination.model';

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/suppliers`;

  getSuppliers(query: SuppliersQuery = {}): Observable<PaginatedResult<Supplier>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    if (query.branchId) params = params.set('branchId', query.branchId);
    if (query.isActive !== undefined) params = params.set('isActive', query.isActive.toString());
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResult<Supplier>>(this.apiUrl, { params });
  }

  getSuppliersByBranch(branchId: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/by-branch/${branchId}`);
  }

  getSupplier(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  createSupplier(data: CreateSupplierDto): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, data);
  }

  updateSupplier(id: string, data: UpdateSupplierDto): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.apiUrl}/${id}`, data);
  }

  deleteSupplier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
