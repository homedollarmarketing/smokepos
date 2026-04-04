import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthStateService } from '../../features/auth/services/auth-state.service';
import { CustomerAuthService } from '../../features/auth/services/customer-auth.service';

let isRefreshing = false;

/**
 * HTTP interceptor that:
 * - Adds Authorization header with access token
 * - Handles 401 errors by attempting token refresh
 * - Logs out user if refresh fails
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authState = inject(AuthStateService);
    const customerAuth = inject(CustomerAuthService);

    // Skip auth header for public auth endpoints (except logout and me)
    const isPublicAuthEndpoint = req.url.includes('/auth/customers/') &&
        !req.url.includes('/auth/customers/logout') &&
        !req.url.includes('/auth/customers/me');

    if (isPublicAuthEndpoint) {
        return next(req);
    }

    const token = authState.accessToken();

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !isRefreshing && !req.url.includes('/refresh')) {
                isRefreshing = true;

                return customerAuth.refreshToken().pipe(
                    switchMap(() => {
                        isRefreshing = false;
                        const newToken = authState.accessToken();

                        const retryReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });

                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        isRefreshing = false;
                        authState.clearAuth();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
