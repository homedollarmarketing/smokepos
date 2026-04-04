import { Routes } from '@angular/router';

export const MESSAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/messages-list/messages-list.component').then((m) => m.MessagesListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/message-details/message-details.component').then(
        (m) => m.MessageDetailsComponent
      ),
  },
];
