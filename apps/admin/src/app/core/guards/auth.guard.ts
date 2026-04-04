import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = () => {
    const storage = inject(StorageService);
    const router = inject(Router);

    if (storage.isAuthenticated()) {
        return true;
    }

    router.navigate(['/auth/login']);
    return false;
};

// Guard to redirect away from auth pages if already logged in
export const noAuthGuard: CanActivateFn = () => {
    const storage = inject(StorageService);
    const router = inject(Router);

    if (!storage.isAuthenticated()) {
        return true;
    }

    router.navigate(['/dashboard']);
    return false;
};
