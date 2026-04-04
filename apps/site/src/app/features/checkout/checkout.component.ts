import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrdersService, CreateOrderDto } from '../../core/services/orders.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly seoService = inject(SeoService);

  // Cart data
  readonly items = this.cartService.items;
  readonly total = this.cartService.total;
  readonly itemCount = this.cartService.itemCount;
  readonly isEmpty = this.cartService.isEmpty;

  // State
  readonly isLoading = signal(false);
  readonly isLoadingAddress = signal(true);
  readonly error = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  // Form
  checkoutForm!: FormGroup;

  ngOnInit(): void {
    this.seoService.updateTags({
      title: 'Checkout',
      description: 'Complete your order at Mr. P Authentic Autoparts.',
    });

    // Redirect to cart if empty
    if (this.isEmpty()) {
      this.router.navigate(['/cart']);
      return;
    }

    this.initForm();
    this.loadSavedAddress();
  }

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      notes: [''],
    });
  }

  private loadSavedAddress(): void {
    this.ordersService.getSavedShippingAddress().subscribe({
      next: (response) => {
        if (response.shippingAddress) {
          this.checkoutForm.patchValue({
            shippingAddress: response.shippingAddress,
          });
        }
        this.isLoadingAddress.set(false);
      },
      error: () => {
        this.isLoadingAddress.set(false);
      },
    });
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid || this.isSubmitting()) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const dto: CreateOrderDto = {
      items: this.items().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      shippingAddress: this.checkoutForm.get('shippingAddress')?.value,
      notes: this.checkoutForm.get('notes')?.value || undefined,
    };

    this.ordersService.createOrder(dto).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.router.navigate(['/account/orders', order.id], {
          queryParams: { success: 'true' },
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to place order. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  // Form helpers
  get shippingAddressControl() {
    return this.checkoutForm.get('shippingAddress');
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.checkoutForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
