import { Routes } from '@angular/router';

export const SERVICE_BOOKINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/bookings-list/bookings-list.component').then((m) => m.BookingsListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/booking-form/booking-form.component').then((m) => m.BookingFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/booking-details/booking-details.component').then(
        (m) => m.BookingDetailsComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/booking-form/booking-form.component').then((m) => m.BookingFormComponent),
  },
];
