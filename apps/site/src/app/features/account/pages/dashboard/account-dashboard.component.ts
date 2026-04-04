import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { AuthStateService } from '../../../auth/services/auth-state.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { CustomerVehiclesService } from '../../services/customer-vehicles.service';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-dashboard.component.html',
  styleUrl: './account-dashboard.component.scss',
})
export class AccountDashboardComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly ordersService = inject(OrdersService);
  private readonly wishlistService = inject(WishlistService);
  private readonly vehiclesService = inject(CustomerVehiclesService);

  readonly customer = this.authState.customer;

  // Stats signals
  readonly totalOrders = signal(0);
  readonly activeOrders = signal(0);
  readonly savedVehicles = signal(0);
  readonly wishlistCount = this.wishlistService.wishlistCount;
  readonly isLoadingStats = signal(true);

  readonly quickActions = [
    {
      label: 'Shop Parts',
      description: 'Browse authentic parts',
      icon: 'shopping-bag',
      route: '/store',
      color: 'bg-red-600',
    },
    {
      label: 'Book Service',
      description: 'Schedule installation',
      icon: 'tool',
      route: '/account/service',
      color: 'bg-green-600',
    },
    {
      label: 'My Vehicles',
      description: 'Manage your garage',
      icon: 'car',
      route: '/account/vehicles',
      color: 'bg-purple-600',
    },
  ];

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.isLoadingStats.set(true);

    forkJoin({
      orderStats: this.ordersService
        .getStats()
        .pipe(catchError(() => of({ totalOrders: 0, activeOrders: 0 }))),
      vehicles: this.vehiclesService.getMyVehicles().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ orderStats, vehicles }) => {
        this.totalOrders.set(orderStats.totalOrders);
        this.activeOrders.set(orderStats.activeOrders);
        this.savedVehicles.set(vehicles.length);
        this.isLoadingStats.set(false);
      },
      error: () => {
        this.isLoadingStats.set(false);
      },
    });
  }
}
