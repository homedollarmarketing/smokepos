import { Injectable, inject, signal, computed, OnDestroy, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, forkJoin, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { BranchService } from './branch.service';

export interface SidebarBadgeCounts {
  messages: number;
  orders: number;
  salesPayments: number;
  serviceBookings: number;
}

@Injectable({
  providedIn: 'root',
})
export class SidebarBadgeService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly branchService = inject(BranchService);

  private refreshSubscription: Subscription | null = null;
  private readonly REFRESH_INTERVAL = 60000; // 60 seconds

  // Badge counts signals
  readonly messagesCount = signal(0);
  readonly ordersCount = signal(0);
  readonly salesPaymentsCount = signal(0);
  readonly serviceBookingsCount = signal(0);

  // Computed map for easy access by key
  readonly badgeCounts = computed<SidebarBadgeCounts>(() => ({
    messages: this.messagesCount(),
    orders: this.ordersCount(),
    salesPayments: this.salesPaymentsCount(),
    serviceBookings: this.serviceBookingsCount(),
  }));

  constructor() {
    // Refresh counts when branch changes
    effect(() => {
      const branchId = this.branchService.currentBranchId();
      if (branchId) {
        this.refreshCounts();
      }
    });

    this.startRefreshing();
  }

  ngOnDestroy() {
    this.stopRefreshing();
  }

  /**
   * Start periodic refresh of badge counts
   */
  startRefreshing() {
    this.stopRefreshing();

    this.refreshSubscription = interval(this.REFRESH_INTERVAL)
      .pipe(startWith(0))
      .subscribe(() => this.refreshCounts());
  }

  /**
   * Stop periodic refresh
   */
  stopRefreshing() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  /**
   * Manually trigger a refresh
   */
  refreshCounts() {
    const branchId = this.branchService.currentBranchId();
    const isMainBranch = this.branchService.currentBranch()?.isMain ?? false;

    if (!branchId) return;

    // Only fetch counts for endpoints the user has permission to access
    const requests: { [key: string]: any } = {};

    // Messages - only on main branch with message.view permission
    if (isMainBranch && this.authService.hasPermission('message.view')) {
      requests['messages'] = this.http
        .get<{ unread: number }>(`${environment.apiUrl}/messages/stats`)
        .pipe(catchError(() => of({ unread: 0 })));
    }

    // Orders - only on main branch with order.view permission
    if (isMainBranch && this.authService.hasPermission('order.view')) {
      requests['orders'] = this.http
        .get<{ pending: number }>(`${environment.apiUrl}/orders/stats`)
        .pipe(catchError(() => of({ pending: 0 })));
    }

    // Sales Payments - branch scoped with sale.approve_payment permission
    if (this.authService.hasPermission('sale.approve_payment')) {
      requests['salesPayments'] = this.http
        .get<{ pending: number }>(`${environment.apiUrl}/sales/payments/stats?branchId=${branchId}`)
        .pipe(catchError(() => of({ pending: 0 })));
    }

    // Service Bookings - branch scoped with serviceBooking.view permission
    if (this.authService.hasPermission('serviceBooking.view')) {
      requests['serviceBookings'] = this.http
        .get<{
          pending: number;
        }>(`${environment.apiUrl}/service-bookings/stats?branchId=${branchId}`)
        .pipe(catchError(() => of({ pending: 0 })));
    }

    // If no requests to make, reset all counts
    if (Object.keys(requests).length === 0) {
      this.messagesCount.set(0);
      this.ordersCount.set(0);
      this.salesPaymentsCount.set(0);
      this.serviceBookingsCount.set(0);
      return;
    }

    forkJoin(requests).subscribe((results: any) => {
      this.messagesCount.set(results['messages']?.unread ?? 0);
      this.ordersCount.set(results['orders']?.pending ?? 0);
      this.salesPaymentsCount.set(results['salesPayments']?.pending ?? 0);
      this.serviceBookingsCount.set(results['serviceBookings']?.pending ?? 0);
    });
  }

  /**
   * Get badge count for a specific key
   */
  getBadgeCount(key: keyof SidebarBadgeCounts): number {
    return this.badgeCounts()[key];
  }
}
