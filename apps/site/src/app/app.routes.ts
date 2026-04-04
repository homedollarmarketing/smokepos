import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
        data: {
          seo: {
            title: 'Home',
            description:
              'Official monaer Distributor. Premium genuine European vehicle parts for BMW, Mercedes-Benz, Audi, Porsche, and more.',
          },
        },
      },
      {
        path: 'store',
        loadComponent: () =>
          import('./features/store/store.component').then((m) => m.StoreComponent),
        data: {
          seo: {
            title: 'Store',
            description: 'Browse our extensive catalog of genuine European auto parts.',
          },
        },
      },
      {
        path: 'store/:slug',
        loadComponent: () =>
          import('./features/product-details/product-details.component').then(
            (m) => m.ProductDetailsComponent
          ),
        // Title/Desc will be set dynamically in component
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services.component').then((m) => m.ServicesComponent),
        data: {
          seo: {
            title: 'Services',
            description:
              'Professional automotive services including installation, repairs, and maintenance.',
          },
        },
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then((m) => m.AboutComponent),
        data: {
          seo: {
            title: 'About Us',
            description:
              'Learn about Mr. P Authentic Autoparts - your trusted source for genuine European auto parts in Africa.',
          },
        },
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact.component').then((m) => m.ContactComponent),
        data: {
          seo: {
            title: 'Contact Us',
            description:
              'Get in touch with Mr. P Authentic Autoparts. Visit our store or contact us online.',
          },
        },
      },
      {
        path: 'monaer',
        loadComponent: () =>
          import('./features/monaer/monaer.component').then((m) => m.MonaerComponent),
        data: {
          seo: {
            title: 'monaer',
            description: 'Official monaer distributor in Uganda. Premium quality automotive parts.',
          },
        },
      },
      {
        path: 'blog',
        loadComponent: () => import('./features/blog/blog.component').then((m) => m.BlogComponent),
        data: {
          seo: {
            title: 'Blog',
            description: 'Automotive tips, news, and insights from Mr. P Authentic Autoparts.',
          },
        },
      },
      // Auth routes - redirect to account if already logged in
      {
        path: 'auth/login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
        canActivate: [noAuthGuard],
        data: {
          seo: {
            title: 'Login',
            description: 'Login to your Mr. P Authentic Autoparts account.',
          },
        },
      },
      {
        path: 'auth/signup',
        loadComponent: () =>
          import('./features/auth/signup/signup.component').then((m) => m.SignupComponent),
        canActivate: [noAuthGuard],
        data: {
          seo: {
            title: 'Create Account',
            description: 'Create your Mr. P Authentic Autoparts account.',
          },
        },
      },
      {
        path: 'auth/verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent
          ),
        canActivate: [noAuthGuard],
        data: {
          seo: {
            title: 'Verify Email',
            description: 'Verify your email address.',
          },
        },
      },
      // Account routes - require authentication
      {
        path: 'account',
        loadComponent: () =>
          import('./features/account/account.component').then((m) => m.AccountComponent),
        canActivate: [authGuard],
        data: {
          seo: {
            title: 'My Account',
            description: 'Manage your account, orders, and preferences.',
          },
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/account/pages/dashboard/account-dashboard.component').then(
                (m) => m.AccountDashboardComponent
              ),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/account/pages/orders/account-orders.component').then(
                (m) => m.AccountOrdersComponent
              ),
            data: { title: 'My Orders' },
          },
          {
            path: 'orders/:id',
            loadComponent: () =>
              import('./features/account/pages/order-details/order-details.component').then(
                (m) => m.OrderDetailsComponent
              ),
            data: { title: 'Order Details' },
          },
          {
            path: 'vehicles',
            loadComponent: () =>
              import('./features/account/pages/vehicles/account-vehicles.component').then(
                (m) => m.AccountVehiclesComponent
              ),
            data: { title: 'My Vehicles' },
          },
          {
            path: 'wishlist',
            loadComponent: () =>
              import('./features/account/pages/wishlist/account-wishlist.component').then(
                (m) => m.AccountWishlistComponent
              ),
            data: { title: 'Wishlist' },
          },
          {
            path: 'service',
            loadComponent: () =>
              import('./features/account/pages/service-bookings/service-bookings.component').then(
                (m) => m.ServiceBookingsComponent
              ),
            data: { title: 'Service Bookings' },
          },
          {
            path: 'service/book',
            loadComponent: () =>
              import('./features/account/pages/book-service/book-service.component').then(
                (m) => m.BookServiceComponent
              ),
            data: { title: 'Book a Service' },
          },
          {
            path: 'rewards',
            loadComponent: () =>
              import('./features/account/pages/placeholder/account-placeholder.component').then(
                (m) => m.AccountPlaceholderComponent
              ),
            data: { title: 'Loyalty & Rewards' },
          },
          {
            path: 'returns',
            loadComponent: () =>
              import('./features/account/pages/placeholder/account-placeholder.component').then(
                (m) => m.AccountPlaceholderComponent
              ),
            data: { title: 'Returns & Warranty' },
          },
          {
            path: 'track-order',
            loadComponent: () =>
              import('./features/account/pages/placeholder/account-placeholder.component').then(
                (m) => m.AccountPlaceholderComponent
              ),
            data: { title: 'Track Order' },
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/account/pages/settings/account-settings.component').then(
                (m) => m.AccountSettingsComponent
              ),
            data: { title: 'Account Settings' },
          },
        ],
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
        data: {
          seo: {
            title: 'Shopping Cart',
            description: 'Review items in your shopping cart.',
          },
        },
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
        canActivate: [authGuard],
        data: {
          seo: {
            title: 'Checkout',
            description: 'Complete your order at Mr. P Authentic Autoparts.',
          },
        },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
