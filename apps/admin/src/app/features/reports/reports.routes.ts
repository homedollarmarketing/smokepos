import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reports-dashboard/reports-dashboard.component').then(
        (m) => m.ReportsDashboardComponent
      ),
  },
  {
    path: 'sales',
    loadComponent: () =>
      import('./pages/sales-report/sales-report.component').then((m) => m.SalesReportComponent),
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./pages/expenses-report/expenses-report.component').then(
        (m) => m.ExpensesReportComponent
      ),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./pages/inventory-report/inventory-report.component').then(
        (m) => m.InventoryReportComponent
      ),
  },
  {
    path: 'procurement',
    loadComponent: () =>
      import('./pages/procurement-report/procurement-report.component').then(
        (m) => m.ProcurementReportComponent
      ),
  },
  {
    path: 'financial',
    loadComponent: () =>
      import('./pages/financial-report/financial-report.component').then(
        (m) => m.FinancialReportComponent
      ),
  },
];
