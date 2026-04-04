import { Routes } from '@angular/router';

export const PROCUREMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'purchase-orders',
    pathMatch: 'full',
  },
  {
    path: 'purchase-orders',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/purchase-orders-list/purchase-orders-list.component').then(
            (m) => m.PurchaseOrdersListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/purchase-order-form/purchase-order-form.component').then(
            (m) => m.PurchaseOrderFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/purchase-order-details/purchase-order-details.component').then(
            (m) => m.PurchaseOrderDetailsComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/purchase-order-form/purchase-order-form.component').then(
            (m) => m.PurchaseOrderFormComponent
          ),
      },
    ],
  },
  {
    path: 'suppliers',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/suppliers-list/suppliers-list.component').then(
            (m) => m.SuppliersListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/supplier-form/supplier-form.component').then(
            (m) => m.SupplierFormComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/supplier-form/supplier-form.component').then(
            (m) => m.SupplierFormComponent
          ),
      },
    ],
  },
];
