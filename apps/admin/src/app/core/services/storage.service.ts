import { Injectable } from '@angular/core';

const TOKEN_KEY = 'mrp_access_token';
const REFRESH_TOKEN_KEY = 'mrp_refresh_token';
const USER_KEY = 'mrp_user';
const VERIFICATION_TOKEN_KEY = 'mrp_verification_token';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    // Access Token
    getAccessToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    setAccessToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    }

    removeAccessToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    }

    // Refresh Token
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    setRefreshToken(token: string): void {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }

    removeRefreshToken(): void {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    // User Data
    getUser<T>(): T | null {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    setUser<T>(user: T): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    removeUser(): void {
        localStorage.removeItem(USER_KEY);
    }

    // Verification Token (for OTP flow)
    getVerificationToken(): string | null {
        return sessionStorage.getItem(VERIFICATION_TOKEN_KEY);
    }

    setVerificationToken(token: string): void {
        sessionStorage.setItem(VERIFICATION_TOKEN_KEY, token);
    }

    removeVerificationToken(): void {
        sessionStorage.removeItem(VERIFICATION_TOKEN_KEY);
    }

    // Clear all auth data
    clearAuth(): void {
        this.removeAccessToken();
        this.removeRefreshToken();
        this.removeUser();
        this.removeVerificationToken();
    }

    // Check if authenticated
    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
}
