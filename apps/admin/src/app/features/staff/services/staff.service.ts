import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/services/auth.service';
import { PaginatedResponse, PaginationQuery } from '../../../shared/models/pagination.model';
import { Staff, CreateStaffDto, UpdateStaffDto } from '../models/staff.model';

@Injectable({
    providedIn: 'root'
})
export class StaffService {
    private readonly apiUrl = `${environment.apiUrl}/staff`;
    private readonly http = inject(HttpClient);

    /**
     * Get paginated list of staff
     */
    getStaff(query: PaginationQuery): Observable<PaginatedResponse<Staff>> {
        let params = new HttpParams()
            .set('page', query.page.toString())
            .set('limit', query.limit.toString());

        if (query.search) {
            params = params.set('search', query.search);
        }

        return this.http.get<PaginatedResponse<Staff>>(this.apiUrl, { params });
    }

    /**
     * Get single staff member by ID
     */
    getStaffById(id: string): Observable<Staff> {
        return this.http.get<Staff>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create a new staff member
     */
    createStaff(data: CreateStaffDto | FormData): Observable<Staff> {
        return this.http.post<Staff>(this.apiUrl, data);
    }

    /**
     * Update an existing staff member
     */
    updateStaff(id: string, data: UpdateStaffDto | FormData): Observable<Staff> {
        return this.http.patch<Staff>(`${this.apiUrl}/${id}`, data);
    }

    /**
     * Delete (deactivate) a staff member
     */
    deleteStaff(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
