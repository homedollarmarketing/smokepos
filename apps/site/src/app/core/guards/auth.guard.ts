import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../../features/auth/services/auth-state.service';

/**
 * Guard to protect routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */
export const authGuard: CanActivateFn = () => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    if (authState.isLoggedIn()) {
        return true;
    }

    router.navigate(['/auth/login']);
    return false;
};

/**
 * Guard to redirect away from auth pages if already logged in.
 * Prevents logged-in users from accessing login, signup, verify-email pages.
 */
export const noAuthGuard: CanActivateFn = () => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    if (!authState.isLoggedIn()) {
        return true;
    }

    router.navigate(['/account']);
    return false;
};
