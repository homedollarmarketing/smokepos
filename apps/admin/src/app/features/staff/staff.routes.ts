import { Routes } from '@angular/router';

export const STAFF_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/staff-list/staff-list.component').then(
                (m) => m.StaffListComponent
            ),
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./pages/staff-form/staff-form.component').then(
                (m) => m.StaffFormComponent
            ),
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./pages/staff-details/staff-details.component').then(
                (m) => m.StaffDetailsComponent
            ),
    },
    {
        path: ':id/edit',
        loadComponent: () =>
            import('./pages/staff-form/staff-form.component').then(
                (m) => m.StaffFormComponent
            ),
    },
];
