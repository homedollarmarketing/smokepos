import { Routes } from '@angular/router';

export const BRANCHES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/branches-list/branches-list.component').then(
        (m) => m.BranchesListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/branch-form/branch-form.component').then(
        (m) => m.BranchFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/branch-details/branch-details.component').then(
        (m) => m.BranchDetailsComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/branch-form/branch-form.component').then(
        (m) => m.BranchFormComponent
      ),
  },
];
