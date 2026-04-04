import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthStateService } from '../../../features/auth/services/auth-state.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    private readonly cartService = inject(CartService);
    private readonly authState = inject(AuthStateService);

    mobileMenuOpen = signal(false);

    // Expose cart item count for badge
    readonly cartItemCount = this.cartService.itemCount;

    // Expose auth state
    readonly isLoggedIn = this.authState.isLoggedIn;

    navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Store', path: '/store' },
        { label: 'Monaer', path: '/monaer' },
        { label: 'Services', path: '/services' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact Us', path: '/contact' }
    ];

    toggleMobileMenu(): void {
        this.mobileMenuOpen.update(v => !v);
    }

    closeMobileMenu(): void {
        this.mobileMenuOpen.set(false);
    }
}
