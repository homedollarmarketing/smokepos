import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { AuthStateService } from '../auth/services/auth-state.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly seoService = inject(SeoService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly items = this.cartService.items;
  readonly itemCount = this.cartService.itemCount;
  readonly total = this.cartService.total;
  readonly isEmpty = this.cartService.isEmpty;
  readonly isLoggedIn = this.authState.isLoggedIn;

  constructor() {
    this.seoService.updateTags({
      title: 'Shopping Cart',
      description: 'Review items in your shopping cart',
    });
  }

  updateQuantity(productId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.quantity - 1);
    } else {
      this.removeItem(item.product.id);
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear all items from your cart?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    if (!this.authState.isLoggedIn()) {
      // Redirect to login with return URL
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
    } else {
      this.router.navigate(['/checkout']);
    }
  }
}
