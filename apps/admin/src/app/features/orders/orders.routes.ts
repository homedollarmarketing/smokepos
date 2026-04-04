import { Routes } from '@angular/router';
import { PermissionGuard } from '../../core/guards/permission.guard';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-list/orders-list.component').then((m) => m.OrdersListComponent),
    canActivate: [PermissionGuard],
    data: { permission: 'order.view' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/order-details/order-details.component').then((m) => m.OrderDetailsComponent),
    canActivate: [PermissionGuard],
    data: { permission: 'order.view' },
  },
];
