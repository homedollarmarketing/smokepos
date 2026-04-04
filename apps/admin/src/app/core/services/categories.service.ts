import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';
import { PaginatedResult, PaginationQuery } from '../models/pagination.model';

@Injectable({
    providedIn: 'root',
})
export class CategoriesService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/categories`;

    getCategories(query: PaginationQuery): Observable<PaginatedResult<Category>> {
        let params = new HttpParams()
            .set('page', query.page.toString())
            .set('limit', query.limit.toString());

        if (query.search) {
            params = params.set('search', query.search);
        }
        if (query.branchId) {
            params = params.set('branchId', query.branchId);
        }
        if (query.isActive !== undefined) {
            params = params.set('isActive', query.isActive.toString());
        }

        return this.http.get<PaginatedResult<Category>>(this.apiUrl, { params });
    }

    getCategory(id: string): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`);
    }

    createCategory(dto: CreateCategoryDto | FormData): Observable<Category> {
        return this.http.post<Category>(this.apiUrl, dto);
    }

    updateCategory(id: string, dto: UpdateCategoryDto | FormData): Observable<Category> {
        return this.http.patch<Category>(`${this.apiUrl}/${id}`, dto);
    }

    deleteCategory(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
