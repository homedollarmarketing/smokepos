import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    verificationToken: string;
    message: string;
}

export interface VerifyOtpRequest {
    verificationToken: string;
    otp: string;
}

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface Branch {
    id: string;
    name: string;
    code: string;
    isMain: boolean;
    accentColor?: string;
    txtOnAccentColor?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    payload: T;
}

export interface VerifyOtpResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    permissions: string[];
    branches: Branch[];
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ProfileResponse {
    user: AuthUser;
    permissions: string[];
    branches: Branch[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly storage = inject(StorageService);
    private readonly router = inject(Router);
    private readonly apiUrl = `${environment.apiUrl}/auth/admins`;

    // State Signals
    private readonly _user = signal<AuthUser | null>(this.storage.getUser<AuthUser>());
    private readonly _permissions = signal<string[]>([]); // Initialized empty, loaded on login/profile
    private readonly _branches = signal<Branch[]>([]);
    private readonly _isLoading = signal<boolean>(false);

    // Readonly Signals
    readonly user = this._user.asReadonly();
    readonly permissions = this._permissions.asReadonly();
    readonly branches = this._branches.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly isLoggedIn = computed(() => !!this._user());

    constructor() { }

    /**
     * Initialize auth state on app startup
     */
    initializeAuth(): Promise<void> {
        return new Promise((resolve) => {
            if (this.storage.isAuthenticated()) {
                this.getProfile().subscribe({
                    next: () => resolve(),
                    error: () => {
                        this.logout();
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Step 1: Initiate login with credentials
     * Returns verificationToken for OTP verification
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        this._isLoading.set(true);

        return this.http
            .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap((data) => {
                    if (data.verificationToken) {
                        this.storage.setVerificationToken(data.verificationToken);
                    }
                }),
                catchError((error) => {
                    this._isLoading.set(false);
                    return throwError(() => error);
                }),
                tap(() => this._isLoading.set(false))
            );
    }

    /**
     * Step 2: Verify OTP and complete login
     */
    verifyOtp(otp: string): Observable<VerifyOtpResponse> {
        const verificationToken = this.storage.getVerificationToken();

        if (!verificationToken) {
            return throwError(() => new Error('No verification token found. Please start the login process again.'));
        }

        this._isLoading.set(true);

        const payload: VerifyOtpRequest = { verificationToken, otp };

        return this.http
            .post<VerifyOtpResponse>(`${this.apiUrl}/verify-otp`, payload)
            .pipe(
                tap((data) => {
                    if (data) {
                        this.handleLoginSuccess(data);
                    }
                }),
                catchError((error) => {
                    this._isLoading.set(false);
                    return throwError(() => error);
                }),
                tap(() => this._isLoading.set(false))
            );
    }

    /**
     * Refresh access token
     */
    refreshToken(): Observable<RefreshTokenResponse> {
        const refreshToken = this.storage.getRefreshToken();

        if (!refreshToken) {
            return throwError(() => new Error('No refresh token'));
        }

        return this.http
            .post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, { refreshToken })
            .pipe(
                tap((data) => {
                    if (data) {
                        this.storage.setAccessToken(data.accessToken);
                        this.storage.setRefreshToken(data.refreshToken);
                    }
                }),
                catchError((error) => {
                    this.logout();
                    return throwError(() => error);
                })
            );
    }

    /**
     * Get current user profile
     */
    getProfile(): Observable<ProfileResponse> {
        return this.http.get<ProfileResponse>(`${this.apiUrl}/me`).pipe(
            tap((data) => this.setAuthState(data))
        );
    }

    /**
     * Logout and clear all auth data
     */
    logout(): void {
        const refreshToken = this.storage.getRefreshToken();
        if (refreshToken) {
            this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
                error: () => { } // Ignore logout errors
            });
        }

        this.clearAuthState();
        this.router.navigate(['/auth/login']);
    }

    /**
     * Check if user has a specific permission
     */
    hasPermission(permission: string): boolean {
        return this._permissions().includes(permission);
    }

    /**
     * Check if user has any of the specified permissions
     */
    hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(p => this._permissions().includes(p));
    }

    // Private methods

    /**
     * Handle successful login (after OTP verification)
     */
    private handleLoginSuccess(data: VerifyOtpResponse): void {
        this.storage.setAccessToken(data.accessToken);
        this.storage.setRefreshToken(data.refreshToken);
        this.storage.setUser(data.user); // Persist user data
        this.storage.removeVerificationToken();
        this.setAuthState(data);
    }

    /**
     * Set auth state from profile or login response
     */
    private setAuthState(data: ProfileResponse | VerifyOtpResponse): void {
        this._user.set(data.user);
        this._permissions.set(data.permissions);
        this._branches.set(data.branches);
    }

    /**
     * Clear all auth state
     */
    private clearAuthState(): void {
        this.storage.clearAuth();
        this._user.set(null);
        this._permissions.set([]);
        this._branches.set([]);
    }
}
