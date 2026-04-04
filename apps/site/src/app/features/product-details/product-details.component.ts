import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteDataService } from '../../core/services/site-data.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { Product } from '../../core/models/product.interface';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './product-details.component.html',
    styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly siteDataService = inject(SiteDataService);
    private readonly cartService = inject(CartService);
    private readonly seoService = inject(SeoService);

    product = signal<Product | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);
    quantity = signal(1);

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (slug) {
                this.loadProduct(slug);
            }
        });
    }

    loadProduct(slug: string): void {
        this.isLoading.set(true);
        this.error.set(null);
        this.quantity.set(1);

        this.siteDataService.getProductBySlug(slug).subscribe({
            next: (product) => {
                this.product.set(product);
                this.isLoading.set(false);

                // Update SEO
                this.seoService.updateTags({
                    title: `${product.name} - Mr. P Authentic Autoparts`,
                    description: product.description || `Buy ${product.name} at Mr. P Authentic Autoparts. Genuine spare parts.`,
                    image: product.images?.[0]
                });
            },
            error: (err) => {
                console.error('Failed to load product', err);
                this.error.set('Product not found or failed to load.');
                this.isLoading.set(false);
            }
        });
    }

    updateQuantity(change: number): void {
        const newQty = this.quantity() + change;
        if (newQty >= 1) {
            this.quantity.set(newQty);
        }
    }

    addToCart(): void {
        const product = this.product();
        if (product) {
            this.cartService.addToCart(product, this.quantity());
            // Optional: Show toast or feedback
        }
    }

    // Helper to check stock status
    get stockStatus(): 'in-stock' | 'low-stock' | 'out-of-stock' {
        const p = this.product();
        if (!p) return 'out-of-stock';

        if (p.quantity <= 0) return 'out-of-stock';
        if (p.quantity <= p.lowStockThreshold) return 'low-stock';
        return 'in-stock';
    }
}
