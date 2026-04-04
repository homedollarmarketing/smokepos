import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/services/auth.service';
import { PaginatedResponse, PaginationQuery } from '../../../shared/models/pagination.model';

export interface Role {
    id: string;
    name: string;
    slug: string;
    description: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleDto {
    name: string;
    slug: string;
    description?: string;
    permissions: string[];
}

export interface UpdateRoleDto {
    name?: string;
    slug?: string;
    description?: string;
    permissions?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    private readonly apiUrl = `${environment.apiUrl}/roles`;
    private readonly http = inject(HttpClient);

    /**
     * Get paginated list of roles
     */
    getRoles(query: PaginationQuery): Observable<PaginatedResponse<Role>> {
        const params = new HttpParams()
            .set('page', query.page.toString())
            .set('limit', query.limit.toString());

        return this.http.get<PaginatedResponse<Role>>(this.apiUrl, { params });
    }

    /**
     * Get single role by ID
     */
    getRole(id: string): Observable<Role> {
        return this.http.get<Role>(`${this.apiUrl}/${id}`);
    }

    /**
     * Get all available permissions
     */
    getPermissions(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/permissions`);
    }

    /**
     * Create a new role
     */
    createRole(data: CreateRoleDto): Observable<Role> {
        return this.http.post<Role>(this.apiUrl, data);
    }

    /**
     * Update an existing role
     */
    updateRole(id: string, data: UpdateRoleDto): Observable<Role> {
        return this.http.patch<Role>(`${this.apiUrl}/${id}`, data);
    }

    /**
     * Delete a role
     */
    deleteRole(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
