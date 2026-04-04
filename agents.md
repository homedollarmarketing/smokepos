# Agents Guide - Mr P Authentic Auto Parts

> A comprehensive guide for LLM agents to interact with and add features to this monorepo.

## Project Overview

**Mr P Authentic Auto Parts** is a full-stack e-commerce platform for genuine European vehicle parts. It's built as a pnpm monorepo with:

- **Backend API**: NestJS (Node.js) with TypeORM and PostgreSQL
- **Admin Dashboard**: Angular 21 (standalone components, signals)
- **Customer Website**: Angular 21 with SSR (must be responsive)

---

## Tech Stack

| Layer           | Technology                                          |
| --------------- | --------------------------------------------------- |
| Package Manager | pnpm (v9+) with workspaces                          |
| Backend         | NestJS 11, TypeORM 0.3, PostgreSQL                  |
| Frontend        | Angular 21, PrimeNG, SCSS                           |
| Auth            | JWT (access + refresh tokens), OTP verification     |
| API Versioning  | URI-based (`/v1/...`) - **included in environment** |
| Storage         | AWS S3-compatible object storage                    |
| Email           | Nodemailer                                          |

---

## Folder Structure

```
mrpauthenticautoparts/
├── package.json              # Root workspace scripts
├── pnpm-workspace.yaml       # Workspace config: apps/*
├── tsconfig.base.json        # Shared TypeScript config
│
├── apps/
│   ├── api/                  # NestJS Backend API
│   │   ├── src/
│   │   │   ├── main.ts       # Bootstrap, versioning, swagger
│   │   │   ├── app.module.ts # Root module with global guards/interceptors
│   │   │   ├── config/       # Environment, database config
│   │   │   ├── common/       # Shared decorators, guards, filters, DTOs
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── public.decorator.ts
│   │   │   │   │   ├── require-permission.decorator.ts
│   │   │   │   │   └── req-auth-user.decorator.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts       # Global JWT auth
│   │   │   │   │   └── permission.guard.ts # Permission checking
│   │   │   │   ├── filters/      # Exception filters
│   │   │   │   ├── interceptors/ # Response transform
│   │   │   │   ├── dto/          # Shared DTOs (pagination, etc.)
│   │   │   │   └── types/        # Shared interfaces
│   │   │   └── modules/
│   │   │       ├── auth/         # Authentication (User entity, sessions, OTP)
│   │   │       ├── products/     # Products, categories, brands
│   │   │       ├── roles/        # Staff roles and permissions
│   │   │       ├── staff/        # Staff management
│   │   │       ├── branches/     # Branch management
│   │   │       ├── customers/    # Customer management
│   │   │       ├── sales/        # Sales and POS
│   │   │       ├── orders/       # Customer orders
│   │   │       ├── procurement/  # Purchase orders, suppliers
│   │   │       ├── expenses/     # Expense tracking
│   │   │       ├── messages/     # Customer messages
│   │   │       ├── service-bookings/  # Vehicle service appointments
│   │   │       ├── reports/      # Business reports
│   │   │       ├── dashboard/    # Dashboard statistics
│   │   │       ├── audit-logs/   # Activity logging
│   │   │       ├── site/         # Public endpoints for website
│   │   │       └── shared/       # Shared services (email, storage, PDF)
│   │   └── data/                 # Seed data JSON files
│   │
│   ├── admin/                # Angular Admin Dashboard
│   │   └── src/app/
│   │       ├── app.config.ts  # Providers, interceptors, PrimeNG
│   │       ├── app.routes.ts  # Lazy-loaded routes
│   │       ├── core/          # Singleton services, guards, interceptors
│   │       │   ├── services/
│   │       │   │   ├── auth.service.ts    # Auth state, permissions
│   │       │   │   └── storage.service.ts # Token storage
│   │       │   ├── guards/
│   │       │   │   └── auth.guard.ts
│   │       │   └── interceptors/
│   │       │       ├── auth.interceptor.ts     # Attach JWT, refresh
│   │       │       ├── response.interceptor.ts # Unwrap API response
│   │       │       └── error.interceptor.ts    # Error handling
│   │       ├── features/      # Feature modules (lazy-loaded)
│   │       │   ├── auth/      # Login, OTP verification
│   │       │   ├── dashboard/
│   │       │   ├── roles/
│   │       │   ├── staff/
│   │       │   ├── products/
│   │       │   ├── categories/
│   │       │   ├── brands/
│   │       │   ├── customers/
│   │       │   ├── sales/
│   │       │   ├── orders/
│   │       │   ├── expenses/
│   │       │   ├── procurement/
│   │       │   ├── reports/
│   │       │   ├── service-bookings/
│   │       │   ├── messages/
│   │       │   └── audit-logs/
│   │       ├── layout/        # Main layout, sidebar, header
│   │       └── shared/        # Shared components, directives, pipes
│   │
│   └── site/                 # Angular SSR Customer Website (RESPONSIVE)
│       └── src/app/
│           ├── app.config.ts
│           ├── app.routes.ts
│           ├── core/          # Services, guards, interceptors
│           ├── features/      # Feature modules
│           │   ├── home/      # Homepage with sections
│           │   ├── store/     # Product catalog
│           │   ├── product-details/
│           │   ├── cart/      # Shopping cart
│           │   ├── checkout/
│           │   ├── auth/      # Customer login/register
│           │   ├── account/   # Customer account pages
│           │   ├── about/
│           │   ├── contact/
│           │   ├── services/
│           │   ├── blog/
│           │   └── monaer/    # Brand partnership page
│           └── layout/        # Header, footer, navigation
```

---

## Module Structure Conventions

### Simple Module (Single Controller/Service)

When a module has only one controller and one service, place them directly in the module folder:

```
modules/roles/
├── entities/
│   └── role.entity.ts
├── dto/
│   ├── create-role.dto.ts
│   └── update-role.dto.ts
├── roles.controller.ts      # Direct in module folder
├── roles.service.ts         # Direct in module folder
└── roles.module.ts
```

### Complex Module (Multiple Controllers/Services)

When a module has multiple controllers or services, organize them in dedicated folders:

```
modules/products/
├── entities/
│   ├── product.entity.ts
│   ├── category.entity.ts
│   └── brand.entity.ts
├── dtos/
│   ├── product.dto.ts
│   ├── category.dto.ts
│   └── brand.dto.ts
├── controllers/              # Dedicated folder
│   ├── products.controller.ts
│   ├── categories.controller.ts
│   └── brands.controller.ts
├── services/                 # Dedicated folder
│   ├── products.service.ts
│   ├── categories.service.ts
│   └── brands.service.ts
└── products.module.ts
```

---

## Build and Development Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Run all apps in parallel
pnpm dev:api          # Run API only (port 3010)
pnpm dev:admin        # Run admin (port 3011)
pnpm dev:site         # Run site SSR (port 3012)

# Build
pnpm build            # Build all
pnpm build:api        # Build API only
pnpm build:admin      # Build admin only
pnpm build:site       # Build site only

# Production
pnpm start:api        # Start API in production mode
pnpm start:site       # Start site SSR in production mode

# Seed data
pnpm seed:admin       # Seed initial admin user

# Database migrations (run from apps/api directory)
pnpm migration:create    # Create new migration
pnpm migration:generate  # Generate migration from entities
pnpm migration:run       # Run pending migrations
pnpm migration:revert    # Revert last migration

# Linting & Testing
pnpm lint
pnpm test
pnpm format           # Format with Prettier
```

---

## Code Style Guidelines

### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

### ESLint Rules

- `@typescript-eslint/no-unused-vars`: Error, with `argsIgnorePattern: '^_'`
- Extends: `eslint:recommended`, `@typescript-eslint/recommended`, `prettier`

### Naming Conventions

| Type        | Pattern                  | Example                   |
| ----------- | ------------------------ | ------------------------- |
| Entity      | `{name}.entity.ts`       | `product.entity.ts`       |
| DTO         | `{action}-{name}.dto.ts` | `create-product.dto.ts`   |
| Service     | `{name}.service.ts`      | `products.service.ts`     |
| Controller  | `{name}.controller.ts`   | `products.controller.ts`  |
| Module      | `{name}.module.ts`       | `products.module.ts`      |
| Component   | `{name}.component.ts`    | `roles-list.component.ts` |
| Guard       | `{name}.guard.ts`        | `auth.guard.ts`           |
| Interceptor | `{name}.interceptor.ts`  | `response.interceptor.ts` |

### TypeScript Conventions

- All primary keys use UUID
- Column naming: `snake_case` in DB, `camelCase` in TypeScript
- All entities have `createdAt` and `updatedAt` timestamps
- Entity class names are singular (e.g., `Product`, not `Products`)
- Database table names are plural (e.g., `products`)

---

## Testing Instructions

### Backend (NestJS)

```bash
# Unit tests
cd apps/api && pnpm test

# Test with coverage
pnpm test:cov

# E2E tests
pnpm test:e2e

# Watch mode
pnpm test:watch
```

Jest configuration:
- Root dir: `src`
- Test regex: `.*\.spec\.ts$`
- Coverage directory: `../coverage`

### Frontend (Angular)

```bash
# Unit tests
cd apps/admin && pnpm test
cd apps/site && pnpm test
```

Uses Karma + Jasmine test runner.

---

## Main Branch Constraint (Site App)

### Critical Rule

The **Site app** (customer website) only communicates with the **Main Branch**. The `Branch` entity has an `isMain` boolean field - only ONE branch can have `isMain: true`.

### Backend Responsibility

**The backend is responsible for enforcing main branch constraints.** The site does NOT specify which branch it communicates with.

#### For Data Retrieval (Products, Categories, Brands, etc.)

All data served to the site must be filtered by main branch:

```typescript
// In site-related services
@Injectable()
export class SiteProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Branch) private branchRepo: Repository<Branch>
  ) {}

  private async getMainBranchId(): Promise<string> {
    const mainBranch = await this.branchRepo.findOne({ where: { isMain: true } });
    if (!mainBranch) throw new NotFoundException('Main branch not configured');
    return mainBranch.id;
  }

  async findAll(query: PaginationQueryDto) {
    const mainBranchId = await this.getMainBranchId();

    const [data, total] = await this.productRepo.findAndCount({
      where: { branchId: mainBranchId, isActive: true },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return { data, pagination: createPaginationMeta(query, total) };
  }
}
```

#### For Data Creation (Orders, Messages, Customer Signups)

All records created from the site must be assigned to the main branch:

```typescript
async createOrder(dto: CreateOrderDto, customerId: string) {
  const mainBranchId = await this.getMainBranchId();

  const order = this.orderRepo.create({
    ...dto,
    customerId,
    branchId: mainBranchId, // Always main branch
  });

  return this.orderRepo.save(order);
}
```

#### Exception: Customer-Owned Records

Endpoints that return customer-specific records (orders, messages belonging to the logged-in customer) may omit the main branch constraint since customers only have access to their own records:

```typescript
// Customer can only see their own orders - no branch filter needed
async getCustomerOrders(customerId: string, query: PaginationQueryDto) {
  const [data, total] = await this.orderRepo.findAndCount({
    where: { customerId }, // Branch filter not required
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });

  return { data, pagination: createPaginationMeta(query, total) };
}
```

---

## Authentication & Authorization

### User Types

| Entity     | Description                     | Auth Flow                            |
| ---------- | ------------------------------- | ------------------------------------ |
| `User`     | Base authentication entity      | Email/password + OTP                 |
| `Staff`    | Admin users (linked to User)    | Access via admin app, has roles      |
| `Customer` | Customer users (linked to User) | Access via site app, owns their data |

### Account Types

The `User.accountType` field determines the user type:

- `'admin'` - Staff/admin users
- `'customer'` - Customer users

### Permission System

Permissions follow the pattern: `{entity}.{action}`

**Available actions**: `view`, `create`, `edit`, `delete`

**Permission groups** (defined in `role.entity.ts`):

```typescript
export const PermissionGroups = {
  admin: ['admin.view', 'admin.create', 'admin.edit', 'admin.delete'],
  role: ['role.view', 'role.create', 'role.edit', 'role.delete'],
  auditLog: ['auditLog.view'],
  branch: ['branch.view', 'branch.create', 'branch.edit', 'branch.delete'],
  product: ['product.view', 'product.create', 'product.edit', 'product.delete'],
  category: ['category.view', 'category.create', 'category.edit', 'category.delete'],
  brand: ['brand.view', 'brand.create', 'brand.edit', 'brand.delete'],
  customer: ['customer.view', 'customer.create', 'customer.edit', 'customer.delete'],
  staff: ['staff.view', 'staff.create', 'staff.edit', 'staff.delete'],
  sale: [...createCRUD('sale'), 'sale.approve_payment'],
  order: createCRUD('order'),
  message: [...createCRUD('message'), 'message.reply'],
  expense: [...createCRUD('expense'), 'expense.approve'],
  supplier: createCRUD('supplier'),
  purchaseOrder: [...createCRUD('purchaseOrder'), 'purchaseOrder.approve', 'purchaseOrder.receive'],
  inventory: ['inventory.view', 'inventory.view_quantity', 'inventory.adjust'],
  serviceBooking: createCRUD('serviceBooking'),
  report: ['report.view', 'report.sales', 'report.expenses', 'report.inventory', 'report.procurement', 'report.financial', 'report.export'],
  dashboard: ['dashboard.view', 'dashboard.sales', 'dashboard.expenses', 'dashboard.inventory', 'dashboard.financial'],
};
```

### Backend Decorators & Guards

#### `@Public()`

Marks an endpoint as publicly accessible (no authentication required).

```typescript
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Get('products')
findAllPublic() { ... }
```

#### `@RequirePermission(...permissions)`

Requires the user to have **at least one** of the specified permissions (OR logic).

```typescript
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Controller({ path: 'roles', version: '1' })
@UseGuards(PermissionGuard)
export class RolesController {

  @Post()
  @RequirePermission('role.create')
  create(@Body() dto: CreateRoleDto) { ... }

  @Get('permissions')
  @RequirePermission('role.view', 'role.create', 'role.edit') // OR - needs any one
  getPermissions() { ... }
}
```

#### `@ReqAuthUser()`

Extracts the authenticated user from the request. The decorator supports extracting specific properties or the full `AuthUser` object.

```typescript
import { ReqAuthUser } from '../../common/decorators/req-auth-user.decorator';
import { AuthUser } from '../../common/types/auth-user.interface';

// Get the full AuthUser object
@Post()
create(@Body() dto: CreateDto, @ReqAuthUser() authUser?: AuthUser) {
  // authUser = { id, email, accountType, staffId, customerId }
}

// Extract specific properties
@Post()
createAsStaff(@Body() dto: CreateDto, @ReqAuthUser('staffId') staffId?: string | null) {
  // staffId is extracted directly (null for customers)
}

@Get()
getCustomerData(@ReqAuthUser('customerId') customerId: string | null) {
  // customerId is extracted directly (null for admins)
}
```

**AuthUser Interface:**

```typescript
interface AuthUser {
  id: string; // User entity ID (UUID)
  email: string; // User's email address
  accountType: 'admin' | 'customer';
  staffId?: string | null; // Only for admin accounts
  customerId: string | null; // Only for customer accounts
}
```

### Frontend Permission Checks (Admin App)

Use `AuthService` to check permissions:

```typescript
import { AuthService } from '../core/services/auth.service';

@Component({...})
export class MyComponent {
  private auth = inject(AuthService);

  // In template: *ngIf="canEdit()"
  canEdit = computed(() => this.auth.hasPermission('product.edit'));

  // Check any permission
  canManage = computed(() => this.auth.hasAnyPermission(['product.edit', 'product.delete']));
}
```

---

## API Response Handling

### Response Flow

```
Backend Controller → TransformInterceptor (wraps) → Network → Frontend responseInterceptor (unwraps) → Service
```

### Backend: Response is Wrapped

The global `TransformInterceptor` wraps all responses:

```typescript
// What the backend controller returns:
return { id: '123', name: 'Test' };

// What goes over the network:
{
  "success": true,
  "payload": { "id": "123", "name": "Test" }
}
```

### Frontend: Response is Unwrapped

The `responseInterceptor` unwraps the response before it reaches services:

```typescript
// responseInterceptor extracts payload automatically
// What the service receives:
{ id: '123', name: 'Test' }  // Already unwrapped!
```

### ⚠️ Important: Frontend Services Should NOT Expect Wrapped Response

```typescript
// ❌ WRONG - Don't expect wrapped response
this.http.get<ApiResponse<Role[]>>(url).pipe(
  map((res) => res.payload) // Not needed!
);

// ✅ CORRECT - Response is already unwrapped
this.http.get<Role[]>(url); // Direct type
```

---

## API URL Configuration

### Environment Already Includes Version

```typescript
// apps/admin/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3010/v1', // ← Version already included!
};
```

### ⚠️ Services Should NOT Add Version

```typescript
// ❌ WRONG - Don't add /v1/
private readonly apiUrl = `${environment.apiUrl}/v1/roles`;

// ✅ CORRECT - Version is already in environment
private readonly apiUrl = `${environment.apiUrl}/roles`;
```

---

## Pagination

### Backend Pattern

```typescript
// Controller
@Get()
findAll(@Query() query: PaginationQueryDto) {
  return this.service.findAll(query);
}

// Service
async findAll(query: PaginationQueryDto) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const [data, total] = await this.repo.findAndCount({
    skip,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  return {
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
```

### Frontend: Consistent Pagination UI

All paginated lists should use this consistent UI pattern:

```html
<!-- Pagination Controls -->
<div class="pagination-controls">
  <button pButton label="Prev" [disabled]="!canGoPrev()" (click)="onPrevPage()"></button>

  <span class="pagination-info"> {{ pagination().page }} of {{ pagination().totalPages }} </span>

  <button pButton label="Next" [disabled]="!canGoNext()" (click)="onNextPage()"></button>
</div>
```

```typescript
// Component
readonly pagination = signal<PaginationMeta>({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
});

readonly canGoPrev = computed(() => this.pagination().page > 1);
readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

onPrevPage() {
  if (this.canGoPrev()) {
    this.loadData(this.pagination().page - 1);
  }
}

onNextPage() {
  if (this.canGoNext()) {
    this.loadData(this.pagination().page + 1);
  }
}

loadData(page: number = 1) {
  this.service.getItems({ page, limit: 20 }).subscribe({
    next: (response) => {
      this.items.set(response.data);
      this.pagination.set(response.pagination);
    },
  });
}
```

### Pagination Styles (SCSS)

```scss
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;

  .pagination-info {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
}
```

---

## Site App - Responsive Design

### Critical Requirement

The site app **must be responsive** and work well on all device sizes.

### Breakpoints

```scss
// Standard breakpoints
$breakpoints: (
  'sm': 576px,
  // Small devices (phones)
  'md': 768px,
  // Medium devices (tablets)
  'lg': 992px,
  // Large devices (desktops)
  'xl': 1200px,
  // Extra large devices
  'xxl': 1400px, // Extra extra large
);

// Usage
@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

// Mobile-first approach
.container {
  padding: 1rem; // Mobile default

  @include respond-to('md') {
    padding: 1.5rem; // Tablet+
  }

  @include respond-to('lg') {
    padding: 2rem; // Desktop+
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Responsive Grid Example

```scss
.product-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr; // Mobile: 1 column

  @include respond-to('sm') {
    grid-template-columns: repeat(2, 1fr); // Small: 2 columns
  }

  @include respond-to('md') {
    grid-template-columns: repeat(3, 1fr); // Medium: 3 columns
  }

  @include respond-to('lg') {
    grid-template-columns: repeat(4, 1fr); // Large: 4 columns
  }
}
```

### Mobile Navigation

Site header should have responsive navigation (hamburger menu on mobile):

```typescript
@Component({...})
export class HeaderComponent {
  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}
```

---

## API Patterns

### Controller Structure

All controllers use **version 1** URI versioning:

```typescript
@Controller({ path: 'roles', version: '1' })
@UseGuards(PermissionGuard) // If permission-protected
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermission('role.create')
  create(@Body() createDto: CreateRoleDto, @LoggedInUser() user?: any) {
    return this.rolesService.create(createDto, user);
  }

  @Get()
  @RequirePermission('role.view')
  findAll(@Query() query: PaginationQueryDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('role.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('role.edit')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission('role.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
```

---

## Frontend Patterns (Angular 21)

### Component Structure

Use **standalone components** with **signals**:

```typescript
@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss',
})
export class RolesListComponent implements OnInit {
  private readonly service = inject(RolesService);
  private readonly router = inject(Router);

  // State signals
  readonly items = signal<Role[]>([]);
  readonly pagination = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Computed signals
  readonly isEmpty = computed(() => this.items().length === 0);
  readonly canGoPrev = computed(() => this.pagination().page > 1);
  readonly canGoNext = computed(() => this.pagination().page < this.pagination().totalPages);

  ngOnInit() {
    this.loadData();
  }

  loadData(page: number = 1) {
    this.isLoading.set(true);
    this.service.getAll({ page, limit: 20 }).subscribe({
      next: (response) => {
        this.items.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
  }
}
```

### Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/roles`; // No /v1/ needed!

  getRoles(query: PaginationQuery): Observable<PaginatedResponse<Role>> {
    const params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());
    return this.http.get<PaginatedResponse<Role>>(this.apiUrl, { params });
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(data: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, data);
  }

  updateRole(id: string, data: UpdateRoleDto): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${id}`, data);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Route Structure

```typescript
// feature.routes.ts
export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/list.component').then((m) => m.ListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/form/form.component').then((m) => m.FormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/details/details.component').then((m) => m.DetailsComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/form/form.component').then((m) => m.FormComponent),
  },
];
```

---

## Adding a New Feature (Step-by-Step)

### Backend: New Module

1. **Create module folder**: `apps/api/src/modules/{feature}/`

2. **Create entity** (`entities/{feature}.entity.ts`):

```typescript
@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

3. **Create DTOs** (`dto/create-feature.dto.ts`, `dto/update-feature.dto.ts`)

4. **Create service** - If for site, include main branch filtering

5. **Create controller** - Apply `@RequirePermission` as needed

6. **Create module** and add to `AppModule`

7. **Add permissions** to `PermissionGroups` in `role.entity.ts`

### Frontend: New Feature Module

1. **Create feature folder**: `apps/admin/src/app/features/{feature}/`

2. **Create service** (`services/{feature}.service.ts`)

3. **Create pages** in `pages/` folder

4. **Create routes** (`{feature}.routes.ts`)

5. **Add to app.routes.ts**

---

## Audit Logging

Log important actions using `AuditLogsService`:

```typescript
await this.auditLogsService.logAction({
  staffId: user?.id,
  action: 'CREATE',
  entity: 'feature',
  entityId: feature.id,
  description: `Created feature: ${feature.name}`,
  details: { name: feature.name },
});
```

---

## Security Considerations

### Environment Variables

Required environment variables (see `apps/api/src/config/env.config.ts`):

```bash
# Required
JWT_SECRET=              # Min 32 characters
S3_STORAGE_ENDPOINT=     # S3-compatible storage
S3_STORAGE_REGION=
S3_STORAGE_ACCESS_KEY_ID=
S3_STORAGE_SECRET_ACCESS_KEY=
S3_STORAGE_BUCKET_NAME=
S3_STORAGE_BUCKET_ENDPOINT=

# Database (either DATABASE_URL or individual vars)
DATABASE_URL=            # OR DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# Optional
MAIL_HOST=              # For email notifications
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
```

### Security Features

1. **JWT Authentication**: Access tokens (1h expiry) + refresh tokens (7d expiry)
2. **OTP Verification**: Required for admin login
3. **Rate Limiting**: Global throttling (100 requests/minute)
4. **Permission-based Authorization**: Fine-grained access control
5. **CORS**: Configured via `CORS_ALLOWED_ORIGINS`
6. **Input Validation**: Global ValidationPipe with whitelist
7. **SQL Injection Protection**: TypeORM parameterized queries

---

## Deployment

### Production Stack

- **OS**: Ubuntu
- **Node.js**: 20+
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL

### Key Configuration

| Component | Port | Domain |
|-----------|------|--------|
| API       | 3010 | api.mrpauthenticautoparts.com |
| Admin     | 3011 (dev) / static | admin.mrpauthenticautoparts.com |
| Site SSR  | 3012 | mrpauthenticautoparts.com |

See `deploy.md` for detailed deployment instructions.

---

## Important Conventions Summary

| Convention          | Rule                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| API URLs            | Version already in `environment.apiUrl` - don't add `/v1/`                                     |
| Response handling   | Backend wraps, frontend unwraps - services receive raw data                                    |
| Pagination          | All array responses should be paginated                                                        |
| Pagination UI       | Consistent: `Prev` `{page} of {totalPages}` `Next`                                             |
| Main branch         | Site data filtered by `isMain: true` branch                                                    |
| Module structure    | Single service/controller: direct in module; Multiple: use `services/`, `controllers/` folders |
| Site responsiveness | Must work on all screen sizes                                                                  |
| Entity naming       | Singular in code, plural in DB                                                                 |
| Column naming       | snake_case in DB, camelCase in TypeScript                                                      |
| IDs                 | All primary keys use UUID                                                                      |
| Timestamps          | All entities have `createdAt` and `updatedAt`                                                  |

---

## Uncertainty Rule

If any requirement, entity, relationship, or behavior is unclear:

- DO NOT guess
- DO NOT invent
- Ask the user for clarification before writing code

---

## Output Rules

- Output ONLY valid code unless explicitly asked for explanation
- No TODOs, placeholders, or pseudocode
- All imports must resolve
- Code must compile

---

## Architectural Constraints

- Do NOT introduce new architectural patterns (CQRS, GraphQL, DDD layers)
- Do NOT add new libraries without approval
- Follow existing NestJS and Angular patterns exactly
