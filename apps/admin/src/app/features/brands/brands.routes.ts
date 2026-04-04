import { Routes } from '@angular/router';

export const BRANDS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/brands-list/brands-list.component').then(
                (m) => m.BrandsListComponent
            ),
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./pages/brand-form/brand-form.component').then(
                (m) => m.BrandFormComponent
            ),
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./pages/brand-details/brand-details.component').then(
                (m) => m.BrandDetailsComponent
            ),
    },
    {
        path: ':id/edit',
        loadComponent: () =>
            import('./pages/brand-form/brand-form.component').then(
                (m) => m.BrandFormComponent
            ),
    },
];
