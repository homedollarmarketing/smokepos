import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { CustomerAuthService } from '../../../auth/services/customer-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './account-sidebar.component.html',
  styleUrl: './account-sidebar.component.scss',
})
export class AccountSidebarComponent {
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(CustomerAuthService);
  private readonly router = inject(Router);

  menuItems = [
    { label: 'Dashboard', icon: 'grid', route: '/account', exact: true },
    { label: 'My Orders', icon: 'shopping-bag', route: '/account/orders', exact: false },
    { label: 'My Vehicles', icon: 'truck', route: '/account/vehicles', exact: false },
    { label: 'Wishlist', icon: 'heart', route: '/account/wishlist', exact: false },
    { label: 'Book a Service', icon: 'tool', route: '/account/service', exact: false },
    { label: 'Account Settings', icon: 'user', route: '/account/settings', exact: false },
  ];

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });
  }
}
