import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, CreateBrandDto, UpdateBrandDto } from '../models/brand.model';
import { PaginatedResult, PaginationQuery } from '../models/pagination.model';

@Injectable({
    providedIn: 'root',
})
export class BrandsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/brands`;

    getBrands(query: PaginationQuery): Observable<PaginatedResult<Brand>> {
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

        return this.http.get<PaginatedResult<Brand>>(this.apiUrl, { params });
    }

    getBrand(id: string): Observable<Brand> {
        return this.http.get<Brand>(`${this.apiUrl}/${id}`);
    }

    createBrand(dto: CreateBrandDto | FormData): Observable<Brand> {
        return this.http.post<Brand>(this.apiUrl, dto);
    }

    updateBrand(id: string, dto: UpdateBrandDto | FormData): Observable<Brand> {
        return this.http.patch<Brand>(`${this.apiUrl}/${id}`, dto);
    }

    deleteBrand(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
