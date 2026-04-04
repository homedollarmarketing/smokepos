import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Customer, AuthTokens } from '../models/customer.interface';

const AUTH_STORAGE_KEY = 'mrp_auth';

@Injectable({
    providedIn: 'root',
})
export class AuthStateService {
    private readonly platformId = inject(PLATFORM_ID);

    // Auth state signals
    private readonly _isLoggedIn = signal<boolean>(false);
    private readonly _customer = signal<Customer | null>(null);
    private readonly _accessToken = signal<string | null>(null);
    private readonly _refreshToken = signal<string | null>(null);
    private readonly _isInitialized = signal<boolean>(false);

    // Public readonly signals
    readonly isLoggedIn = this._isLoggedIn.asReadonly();
    readonly customer = this._customer.asReadonly();
    readonly accessToken = this._accessToken.asReadonly();
    readonly isInitialized = this._isInitialized.asReadonly();

    constructor() {
        this.loadTokensFromStorage();
    }

    /**
     * Set authenticated state after successful login
     * Only stores tokens - customer is fetched from server
     */
    setAuthenticated(tokens: AuthTokens, customer: Customer): void {
        this._accessToken.set(tokens.accessToken);
        this._refreshToken.set(tokens.refreshToken);
        this._customer.set(customer);
        this._isLoggedIn.set(true);
        this._isInitialized.set(true);
        this.saveTokensToStorage();
    }

    /**
     * Set customer data from profile fetch
     */
    setCustomer(customer: Customer): void {
        this._customer.set(customer);
        this._isLoggedIn.set(true);
        this._isInitialized.set(true);
    }

    /**
     * Update tokens after refresh
     */
    updateTokens(tokens: AuthTokens): void {
        this._accessToken.set(tokens.accessToken);
        this._refreshToken.set(tokens.refreshToken);
        this.saveTokensToStorage();
    }

    /**
     * Clear auth state on logout
     */
    clearAuth(): void {
        this._accessToken.set(null);
        this._refreshToken.set(null);
        this._customer.set(null);
        this._isLoggedIn.set(false);
        this.clearStorage();
    }

    /**
     * Get refresh token for token refresh
     */
    getRefreshToken(): string | null {
        return this._refreshToken();
    }

    /**
     * Check if tokens exist (for initialization check)
     */
    hasTokens(): boolean {
        return !!this._accessToken();
    }

    /**
     * Mark initialization as complete without user
     */
    markInitialized(): void {
        this._isInitialized.set(true);
    }

    /**
     * Load only tokens from storage (not customer data)
     */
    private loadTokensFromStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                const authData = localStorage.getItem(AUTH_STORAGE_KEY);

                if (authData) {
                    const tokens = JSON.parse(authData) as AuthTokens;
                    this._accessToken.set(tokens.accessToken);
                    this._refreshToken.set(tokens.refreshToken);
                    // Note: We don't set isLoggedIn here - that happens after profile fetch
                }
            } catch (e) {
                console.error('Failed to load auth tokens from storage:', e);
                this.clearStorage();
            }
        }
    }

    /**
     * Save only tokens to storage
     */
    private saveTokensToStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                const tokens: AuthTokens = {
                    accessToken: this._accessToken() || '',
                    refreshToken: this._refreshToken() || '',
                };
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
            } catch (e) {
                console.error('Failed to save auth tokens to storage:', e);
            }
        }
    }

    /**
     * Clear storage
     */
    private clearStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }
}
