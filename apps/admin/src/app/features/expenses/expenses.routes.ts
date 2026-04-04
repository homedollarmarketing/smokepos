import { Routes } from '@angular/router';

export const EXPENSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/expense-list/expense-list.component').then((m) => m.ExpenseListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/expense-details/expense-details.component').then(
        (m) => m.ExpenseDetailsComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
];
