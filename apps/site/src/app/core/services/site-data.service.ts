import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Product,
  Category,
  Brand,
  PaginatedResponse,
  ApiResponse,
} from '../models/product.interface';
import { environment } from '../../../environments/environment';

export interface ProductsQuery {
  page?: number;
  limit?: number;
  featured?: boolean;
  category?: string; // category slug
  brand?: string; // brand slug
  search?: string;
}

export interface CategoriesQuery {
  page?: number;
  limit?: number;
}

export interface BrandsQuery {
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SiteDataService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get products from the public site API
   */
  getProducts(query: ProductsQuery = {}): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    if (query.featured !== undefined) params = params.set('featured', query.featured.toString());
    if (query.category) params = params.set('category', query.category);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/site/products`, { params });
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(limit = 8): Observable<PaginatedResponse<Product>> {
    return this.getProducts({ featured: true, limit });
  }

  /**
   * Get product by slug
   */
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/site/products/${slug}`);
  }

  /**
   * Get categories from the public site API
   */
  getCategories(query: CategoriesQuery = {}): Observable<PaginatedResponse<Category>> {
    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());

    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/site/categories`, { params });
  }

  /**
   * Get category by slug
   */
  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/site/categories/${slug}`);
  }

  /**
   * Get brands from the public site API
   */
  getBrands(query: BrandsQuery = {}): Observable<PaginatedResponse<Brand>> {
    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());

    return this.http.get<PaginatedResponse<Brand>>(`${this.apiUrl}/site/brands`, { params });
  }
}
