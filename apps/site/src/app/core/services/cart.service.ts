import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product.interface';

export interface CartItem {
    product: Product;
    quantity: number;
}

const CART_STORAGE_KEY = 'mrp_cart';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private readonly platformId = inject(PLATFORM_ID);

    // Cart items signal for reactive updates
    private readonly _items = signal<CartItem[]>([]);

    // Public readonly signal
    readonly items = this._items.asReadonly();

    // Computed signals
    readonly itemCount = () => this._items().reduce((sum, item) => sum + item.quantity, 0);
    readonly total = () => this._items().reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    readonly isEmpty = () => this._items().length === 0;

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Add a product to the cart
     */
    addToCart(product: Product, quantity = 1): void {
        const items = this._items();
        const existingIndex = items.findIndex(item => item.product.id === product.id);

        if (existingIndex >= 0) {
            // Update quantity if product already exists
            const updatedItems = [...items];
            updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: updatedItems[existingIndex].quantity + quantity
            };
            this._items.set(updatedItems);
        } else {
            // Add new item
            this._items.set([...items, { product, quantity }]);
        }

        this.saveToStorage();
    }

    /**
     * Remove a product from the cart
     */
    removeFromCart(productId: string): void {
        const items = this._items().filter(item => item.product.id !== productId);
        this._items.set(items);
        this.saveToStorage();
    }

    /**
     * Update quantity of a cart item
     */
    updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const items = this._items().map(item =>
            item.product.id === productId ? { ...item, quantity } : item
        );
        this._items.set(items);
        this.saveToStorage();
    }

    /**
     * Clear all items from cart
     */
    clearCart(): void {
        this._items.set([]);
        this.saveToStorage();
    }

    /**
     * Get quantity of a specific product in cart
     */
    getQuantity(productId: string): number {
        const item = this._items().find(item => item.product.id === productId);
        return item?.quantity ?? 0;
    }

    /**
     * Check if product is in cart
     */
    isInCart(productId: string): boolean {
        return this._items().some(item => item.product.id === productId);
    }

    /**
     * Load cart from localStorage
     */
    private loadFromStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                const stored = localStorage.getItem(CART_STORAGE_KEY);
                if (stored) {
                    const items = JSON.parse(stored) as CartItem[];
                    this._items.set(items);
                }
            } catch (e) {
                console.error('Failed to load cart from storage:', e);
            }
        }
    }

    /**
     * Save cart to localStorage
     */
    private saveToStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this._items()));
            } catch (e) {
                console.error('Failed to save cart to storage:', e);
            }
        }
    }
}
