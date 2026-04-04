import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  InitiateLoginResponse,
  VerifyEmailRequest,
  VerifyLoginRequest,
  LoginResponse,
  MessageResponse,
  Customer,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../models/customer.interface';
import { AuthStateService } from './auth-state.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerAuthService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${environment.apiUrl}/auth/customers`;

  /**
   * Initialize auth state on app startup
   * Fetches user profile from server if tokens exist
   */
  async initializeAuth(): Promise<void> {
    // Skip on server-side rendering
    if (!isPlatformBrowser(this.platformId)) {
      this.authState.markInitialized();
      return;
    }

    if (this.authState.hasTokens()) {
      try {
        await firstValueFrom(this.getProfile());
      } catch {
        // Token is invalid or expired, clear auth state
        this.authState.clearAuth();
      }
    }
    this.authState.markInitialized();
  }

  /**
   * Register a new customer
   */
  signup(data: SignupRequest): Observable<SignupResponse> {
    return this.http
      .post<SignupResponse>(`${this.apiUrl}/signup`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Verify email with OTP - auto-logs in the user
   */
  verifyEmail(data: VerifyEmailRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/verify-email`, data).pipe(
      tap((response) => {
        // Store auth state after successful verification (auto-login)
        this.authState.setAuthenticated(
          { accessToken: response.accessToken, refreshToken: response.refreshToken },
          response.customer
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Resend verification OTP
   */
  resendVerificationOtp(email: string): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(`${this.apiUrl}/resend-verification`, { email })
      .pipe(catchError(this.handleError));
  }

  /**
   * Initiate login - sends 2FA OTP
   */
  login(data: LoginRequest): Observable<InitiateLoginResponse> {
    return this.http
      .post<InitiateLoginResponse>(`${this.apiUrl}/login`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Verify login OTP - completes login
   */
  verifyLoginOtp(data: VerifyLoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/verify-login`, data).pipe(
      tap((response) => {
        // Store auth state after successful verification
        this.authState.setAuthenticated(
          { accessToken: response.accessToken, refreshToken: response.refreshToken },
          response.customer
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.authState.getRefreshToken();
    return this.http
      .post<{
        accessToken: string;
        refreshToken: string;
      }>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          this.authState.updateTokens(response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout
   */
  logout(): Observable<MessageResponse> {
    const refreshToken = this.authState.getRefreshToken();
    return this.http.post<MessageResponse>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => {
        this.authState.clearAuth();
      }),
      catchError((error) => {
        // Clear auth even if logout fails
        this.authState.clearAuth();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current customer profile
   */
  getProfile(): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/me`).pipe(
      tap((customer) => {
        this.authState.setCustomer(customer);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update customer profile (name, phone, address)
   */
  updateProfile(data: UpdateProfileRequest): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/me`, data).pipe(
      tap((customer) => {
        this.authState.setCustomer(customer);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Change customer password
   */
  changePassword(data: ChangePasswordRequest): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(`${this.apiUrl}/me/change-password`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Upload profile photo
   */
  uploadPhoto(file: File): Observable<Customer> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Customer>(`${this.apiUrl}/me/photo`, formData).pipe(
      tap((customer) => {
        this.authState.setCustomer(customer);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 409) {
      errorMessage = 'Email already registered';
    } else if (error.status === 400) {
      errorMessage = 'Invalid request';
    }

    return throwError(() => new Error(errorMessage));
  }
}
