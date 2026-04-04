import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteDataService } from '../../core/services/site-data.service';
import { SeoService } from '../../core/services/seo.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Product, Brand, Category } from '../../core/models/product.interface';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss',
})
export class StoreComponent implements OnInit {
  private readonly siteDataService = inject(SiteDataService);
  private readonly seoService = inject(SeoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  // Data Signals
  products = signal<Product[]>([]);
  brands = signal<Brand[]>([]);
  categories = signal<Category[]>([]);

  // UI State Signals
  isLoading = signal(true);
  pagination = signal({ page: 1, limit: 20, totalItems: 0, totalPages: 1 });

  // Filter Signals
  searchQuery = signal('');
  selectedBrand = signal('');
  selectedCategory = signal('');

  // Search Subject for Debouncing
  private searchSubject = new Subject<string>();

  // Track previous params for smart scrolling
  private lastParams: any = {};

  constructor() {
    // Handle search debounce
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.searchQuery.set(value);
        this.updateQueryParams({ search: value, page: 1 });
      });

    // Subscribe to query param changes
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.searchQuery.set(params['search'] || '');
      this.selectedBrand.set(params['brand'] || '');
      this.selectedCategory.set(params['category'] || '');

      const page = Number(params['page']) || 1;
      const limit = Number(params['limit']) || 20;

      // Smart scroll: Don't scroll to top on search input changes (typing)
      // But DO scroll on pagination, brand change, or category change
      const pageChanged = (params['page'] || 1) != (this.lastParams['page'] || 1);
      const brandChanged = params['brand'] != this.lastParams['brand'];
      const categoryChanged = params['category'] != this.lastParams['category'];

      // On first load (empty lastParams), we usually don't need to force scroll unless deep linking?
      // But essentially: if explicit navigation happened.
      // If just searching, only 'search' param changes. page resets to 1 (usually).
      // If I search, page is 1. If I was on page 1, pageChanged is false.

      const shouldScroll = pageChanged || brandChanged || categoryChanged;

      this.lastParams = { ...params };

      this.loadProducts(page, limit, shouldScroll);
    });
  }

  ngOnInit(): void {
    this.seoService.updateTags({
      title: 'Store - Mr. P Authentic Autoparts',
      description:
        'Browse our catalog of authentic European auto parts. Filter by brand, category, and more.',
    });

    // Load metadata
    this.loadBrands();
    this.loadCategories();
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  onBrandChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedBrand.set(value);
    this.updateQueryParams({ brand: value, page: 1 });
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
    this.updateQueryParams({ category: value, page: 1 });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination().totalPages) {
      this.updateQueryParams({ page });
    }
  }

  resetFilters(): void {
    this.updateQueryParams({
      search: null,
      brand: null,
      category: null,
      page: 1,
    });
    // Clear inputs visually if needed via signals
    this.searchQuery.set('');
    this.selectedBrand.set('');
    this.selectedCategory.set('');
  }

  addToCart(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(product);
  }

  toggleWishlist(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist(product);
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  private loadBrands(): void {
    this.siteDataService.getBrands({ limit: 100 }).subscribe((response) => {
      this.brands.set(response.data);
    });
  }

  private loadCategories(): void {
    this.siteDataService.getCategories({ limit: 100 }).subscribe((response) => {
      this.categories.set(response.data);
    });
  }

  private loadProducts(page: number, limit: number, shouldScrollTop = false): void {
    this.isLoading.set(true);
    this.siteDataService
      .getProducts({
        page,
        limit,
        search: this.searchQuery(),
        brand: this.selectedBrand() || undefined,
        category: this.selectedCategory() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.products.set(response.data);
          this.pagination.set(response.pagination);
          this.isLoading.set(false);

          // Scroll to top only if requested (e.g. pagination)
          if (shouldScrollTop && typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.products.set([]);
        },
      });
  }

  private updateQueryParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }
}
