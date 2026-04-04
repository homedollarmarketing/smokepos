import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const PermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    // Note: MessageService usage inside a guard might need specific provider scope, 
    // often better to redirect or just return false. 
    // We'll rely on redirect if needed or just false.

    const requiredPermission = route.data['permission'] as string;

    if (!requiredPermission) {
        return true; // No permission required
    }

    if (authService.hasPermission(requiredPermission)) {
        return true;
    }

    // Optional: Show toast or redirect
    // router.navigate(['/dashboard']); 
    return false;
};
