import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/categories-list/categories-list.component').then(
                (m) => m.CategoriesListComponent
            ),
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./pages/category-form/category-form.component').then(
                (m) => m.CategoryFormComponent
            ),
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./pages/category-details/category-details.component').then(
                (m) => m.CategoryDetailsComponent
            ),
    },
    {
        path: ':id/edit',
        loadComponent: () =>
            import('./pages/category-form/category-form.component').then(
                (m) => m.CategoryFormComponent
            ),
    },
];
