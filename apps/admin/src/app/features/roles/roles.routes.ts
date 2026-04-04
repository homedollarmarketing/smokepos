import { Routes } from '@angular/router';

export const ROLES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/roles-list/roles-list.component').then(
                (m) => m.RolesListComponent
            ),
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./pages/role-form/role-form.component').then(
                (m) => m.RoleFormComponent
            ),
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./pages/role-details/role-details.component').then(
                (m) => m.RoleDetailsComponent
            ),
    },
    {
        path: ':id/edit',
        loadComponent: () =>
            import('./pages/role-form/role-form.component').then(
                (m) => m.RoleFormComponent
            ),
    },
];
