import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteDataService } from '../../../core/services/site-data.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.interface';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss',
})
export class ProductsSectionComponent implements OnInit {
  private readonly siteDataService = inject(SiteDataService);
  private readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  products = signal<Product[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.siteDataService.getFeaturedProducts(8).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
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
}
