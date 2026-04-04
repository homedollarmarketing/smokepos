import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService, WishlistItem } from '../../../../core/services/wishlist.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/models/product.interface';

@Component({
  selector: 'app-account-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-wishlist.component.html',
  styleUrl: './account-wishlist.component.scss',
})
export class AccountWishlistComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  // State
  readonly wishlistItems = signal<WishlistItem[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  // Computed
  readonly isEmpty = computed(() => this.wishlistItems().length === 0 && !this.isLoading());
  readonly totalItems = computed(() => this.wishlistItems().length);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.wishlistItems.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load wishlist');
        this.isLoading.set(false);
      },
    });
  }

  removeFromWishlist(item: WishlistItem): void {
    // Optimistic UI update
    const currentItems = this.wishlistItems();
    this.wishlistItems.set(currentItems.filter((i) => i.id !== item.id));

    // Call service to remove (will handle toast and state)
    this.wishlistService.removeFromWishlist(item.product);
  }

  addToCart(item: WishlistItem): void {
    this.cartService.addToCart(item.product, 1);
  }

  addAllToCart(): void {
    const items = this.wishlistItems();
    items.forEach((item) => {
      this.cartService.addToCart(item.product, 1);
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-UG');
  }

  getProductImage(product: Product): string | null {
    return product.images && product.images.length > 0 ? product.images[0] : null;
  }
}
