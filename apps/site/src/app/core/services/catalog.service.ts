import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
    isActive: boolean;
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    isActive: boolean;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: number;
    salePrice?: number;
    stock: number;
    images: string[];
    isFeatured: boolean;
    isActive: boolean;
    brandId: string;
    categoryId: string;
    brand?: Brand;
    category?: Category;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    brandId?: string;
    categoryId?: string;
    featured?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class CatalogService {
    private readonly apiService = inject(ApiService);

    getProducts(query: ProductQuery = {}): Observable<PaginatedResponse<Product>> {
        return this.apiService.get<PaginatedResponse<Product>>('/site/products', query);
    }

    getBrands(): Observable<PaginatedResponse<Brand>> {
        return this.apiService.get<PaginatedResponse<Brand>>('/site/brands', { limit: 100 });
    }

    getCategories(): Observable<PaginatedResponse<Category>> {
        return this.apiService.get<PaginatedResponse<Category>>('/site/categories', { limit: 100 });
    }
}
