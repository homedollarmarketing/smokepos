import { Injectable, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStateService } from '../../features/auth/services/auth-state.service';
import { ToastService } from './toast.service';
import { Product } from '../models/product.interface';

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface WishlistResponse {
  data: WishlistItem[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);
  private readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${environment.apiUrl}/site/wishlist`;

  // Wishlist state
  private readonly _wishlistProductIds = signal<Set<string>>(new Set());
  private readonly _isLoading = signal(false);

  // Public readonly signals
  readonly wishlistProductIds = computed(() => this._wishlistProductIds());
  readonly wishlistCount = computed(() => this._wishlistProductIds().size);
  readonly isLoading = this._isLoading.asReadonly();

  constructor() {
    // React to auth state changes
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const isLoggedIn = this.authState.isLoggedIn();
        const isInitialized = this.authState.isInitialized();

        if (isInitialized) {
          if (isLoggedIn) {
            this.loadWishlistProductIds();
          } else {
            this._wishlistProductIds.set(new Set());
          }
        }
      });
    }
  }

  /**
   * Load wishlist product IDs if user is logged in
   */
  loadWishlistIfLoggedIn(): void {
    if (this.authState.isLoggedIn()) {
      this.loadWishlistProductIds();
    } else {
      this._wishlistProductIds.set(new Set());
    }
  }

  /**
   * Load just the product IDs (for quick checks)
   */
  private loadWishlistProductIds(): void {
    this._isLoading.set(true);
    this.http
      .get<string[]>(`${this.apiUrl}/product-ids`)
      .pipe(
        catchError(() => of([])),
        tap((ids) => {
          this._wishlistProductIds.set(new Set(ids));
          this._isLoading.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Get full wishlist with product details
   */
  getWishlist(): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(this.apiUrl);
  }

  /**
   * Check if a product is in the wishlist (local check)
   */
  isInWishlist(productId: string): boolean {
    return this._wishlistProductIds().has(productId);
  }

  /**
   * Toggle product in wishlist (add or remove)
   */
  toggleWishlist(product: Product): void {
    if (!this.authState.isLoggedIn()) {
      this.toastService.warn('Please login to add items to your wishlist', 'Login Required');
      return;
    }

    if (this.isInWishlist(product.id)) {
      this.removeFromWishlist(product);
    } else {
      this.addToWishlist(product);
    }
  }

  /**
   * Add product to wishlist
   */
  addToWishlist(product: Product): void {
    if (!this.authState.isLoggedIn()) {
      this.toastService.warn('Please login to add items to your wishlist', 'Login Required');
      return;
    }

    // Optimistic update
    this._wishlistProductIds.update((ids) => {
      const newSet = new Set(ids);
      newSet.add(product.id);
      return newSet;
    });

    this.http
      .post<{ message: string; productId: string }>(`${this.apiUrl}/${product.id}`, {})
      .subscribe({
        next: () => {
          this.toastService.success(`${product.name} added to wishlist`);
        },
        error: (err) => {
          // Revert optimistic update
          this._wishlistProductIds.update((ids) => {
            const newSet = new Set(ids);
            newSet.delete(product.id);
            return newSet;
          });
          if (err.status === 409) {
            // Already in wishlist, just add to local state
            this._wishlistProductIds.update((ids) => {
              const newSet = new Set(ids);
              newSet.add(product.id);
              return newSet;
            });
          } else {
            this.toastService.error('Failed to add to wishlist');
          }
        },
      });
  }

  /**
   * Remove product from wishlist
   */
  removeFromWishlist(product: Product): void {
    // Optimistic update
    this._wishlistProductIds.update((ids) => {
      const newSet = new Set(ids);
      newSet.delete(product.id);
      return newSet;
    });

    this.http
      .delete<{ message: string; productId: string }>(`${this.apiUrl}/${product.id}`)
      .subscribe({
        next: () => {
          this.toastService.success(`${product.name} removed from wishlist`);
        },
        error: () => {
          // Revert optimistic update
          this._wishlistProductIds.update((ids) => {
            const newSet = new Set(ids);
            newSet.add(product.id);
            return newSet;
          });
          this.toastService.error('Failed to remove from wishlist');
        },
      });
  }

  /**
   * Clear local wishlist state (on logout)
   */
  clearWishlist(): void {
    this._wishlistProductIds.set(new Set());
  }
}
