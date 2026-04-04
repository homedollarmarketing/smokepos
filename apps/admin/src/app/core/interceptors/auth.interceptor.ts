import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const storage = inject(StorageService);
    const auth = inject(AuthService);

    // Skip auth header for auth endpoints (except logout and me)
    const isAuthEndpoint = req.url.includes('/auth/admins/') &&
        !req.url.includes('/auth/admins/logout') &&
        !req.url.includes('/auth/admins/me');

    if (isAuthEndpoint) {
        return next(req);
    }

    const token = storage.getAccessToken();

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

                return auth.refreshToken().pipe(
                    switchMap(() => {
                        isRefreshing = false;
                        const newToken = storage.getAccessToken();

                        const retryReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });

                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        isRefreshing = false;
                        auth.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
