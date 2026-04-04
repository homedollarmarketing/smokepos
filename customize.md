# Rebranding & Customization Guide

This document provides a comprehensive plan for rebranding this sales and inventory system for a new business. It covers all elements that need to be changed, organized by category and priority.

---

## Overview

This system consists of three applications:

| App       | Path         | Description                                             |
| --------- | ------------ | ------------------------------------------------------- |
| **API**   | `apps/api`   | NestJS backend (handles PDFs, emails, business logic)   |
| **Admin** | `apps/admin` | Angular dashboard for staff (inventory, sales, reports) |
| **Site**  | `apps/site`  | Angular SSR customer-facing website                     |

---

## 1. Company Identity

### 1.1 Company Name

Replace all instances of the company name throughout the codebase.

| Current Value               | Search Pattern          |
| --------------------------- | ----------------------- |
| `Mr P Authentic Auto Parts` | Case-insensitive search |
| `MR P AUTHENTIC AUTO PARTS` | Uppercase variant       |
| `Mr. P Authentic Autoparts` | Period variant          |
| `MRP` / `mrp`               | Abbreviation            |

**Files to update:**

```
# Root level
README.md                    - Line 1, description
package.json                 - Lines 2, 5 (name, description)
agents.md                    - Lines 1, 7
deploy.md                    - Line 4

# API
apps/api/package.json        - Line 4 (description)
apps/api/src/main.ts         - Lines 40-41 (Swagger docs)
apps/api/test/app.e2e-spec.ts - Line 22

# Admin
apps/admin/package.json      - Line 4 (description)
apps/admin/src/index.html    - Line 5 (title)
apps/admin/src/app/app.component.ts - Line 19 (title)
apps/admin/src/app/layout/main-layout.component.html - Line 9 (header title)
apps/admin/src/app/features/auth/pages/login/login.component.html - Line 5 (logo alt)
apps/admin/src/styles.scss   - Line 2 (comment)
apps/admin/src/styles/_variables.scss - Line 2 (comment)

# Site
apps/site/package.json       - Line 4 (description)
apps/site/src/index.html     - Lines 6, 19, 25, 29 (title, meta tags)
```

### 1.2 Package Names

Update pnpm workspace package names:

| File                      | Current                 | Change To          |
| ------------------------- | ----------------------- | ------------------ |
| `apps/api/package.json`   | `@mrp/api`              | `@{newname}/api`   |
| `apps/admin/package.json` | `@mrp/admin`            | `@{newname}/admin` |
| `apps/site/package.json`  | `@mrp/site`             | `@{newname}/site`  |
| `package.json` (root)     | `mrpauthenticautoparts` | `{newname}`        |

Also update all script references in root `package.json`:

```json
"dev:api": "pnpm --filter @mrp/api run start:dev"
// Change to:
"dev:api": "pnpm --filter @{newname}/api run start:dev"
```

### 1.3 Domain & URLs

| Current                             | Files                                                 |
| ----------------------------------- | ----------------------------------------------------- |
| `mrpauthenticautoparts.com`         | `apps/site/src/index.html` (lines 24, 28, 34, 38, 49) |
| `api.sys.mrpauthenticautoparts.com` | `apps/site/src/environments/environment.prod.ts`      |
| `api.mrpauthenticautoparts.com`     | `deploy.md`                                           |
| `admin.mrpauthenticautoparts.com`   | `deploy.md`                                           |

---

## 2. Theme Colors

### 2.1 Admin Dashboard

**File:** `apps/admin/src/styles/_variables.scss`

```scss
// Current brand colors (lines 5-12)
$primary: #ee1b24; // Red - CHANGE THIS
$primary-dark: #c41920; // Darker red
$primary-light: #ff4d54; // Lighter red
$secondary: #f5f216; // Yellow - CHANGE THIS
$secondary-dark: #d4d10f;
$secondary-light: #f9f74a;
```

Recommended approach: Replace with your brand's primary and secondary colors.

### 2.2 Customer Site

**File:** `apps/site/src/styles.scss`

```css
/* Current brand colors (lines 5-9) */
--primary-red: #e53935; /* CHANGE - Primary brand color */
--primary-red-dark: #c62828; /* Darker variant */
--accent-cyan: #22d3ee; /* CHANGE if needed */
--accent-yellow: #ffc107; /* CHANGE if needed */
```

Also update:

- `--theme-color` in `apps/site/src/index.html` (line 11)
- Focus outline color in `styles.scss` (line 146)

---

## 3. Logo & Assets

### 3.1 Logo Files

Replace these logo files with your company's logo:

```
apps/admin/public/logo.jpg
apps/site/public/logo.jpg
```

Referenced in:

- `apps/admin/src/app/features/auth/pages/login/login.component.html` (line 5)
- `apps/site/src/index.html` (lines 28, 38 - OG/Twitter images)

### 3.2 Favicon

```
apps/site/public/favicon.ico
apps/site/public/apple-touch-icon.png (if exists)
apps/admin/public/favicon.ico (if exists)
```

---

## 4. Contact Information

### 4.1 Phone Numbers

**Current:** `+256 759 204 449`, `+256 791 063 897`

Files to update:

```
# Site
apps/site/src/app/layout/components/footer/footer.component.ts     - Line 37
apps/site/src/app/layout/components/footer/footer.component.html   - Lines 32, 42
apps/site/src/app/features/contact/contact.component.ts            - Line 38
apps/site/src/app/features/contact/contact.component.html          - Lines 228, 242
apps/site/src/app/features/monaer/monaer.component.html            - Lines 181, 188
apps/site/src/app/features/home/sections/faq-section.component.html - Lines 7, 15
apps/site/src/app/features/services/services.component.html         - Line 107
apps/site/src/app/layout/main-layout.component.html                 - Line 11
apps/site/src/app/layout/components/chatbot/chatbot.component.ts    - Lines 109, 117, 119
apps/site/src/app/core/services/seo.service.ts                      - Line 150

# API (PDFs and emails)
apps/api/src/modules/shared/services/pdf.service.ts                 - Line 11
```

### 4.2 Email Address

**Current:** `info@mrpauthenticautoparts.com`

Files to update:

```
apps/site/src/app/layout/components/footer/footer.component.ts      - Line 38
apps/site/src/app/layout/components/footer/footer.component.html    - Line 51
apps/site/src/app/layout/components/chatbot/chatbot.component.ts    - Line 117
README.md                                                           - Line 70
```

### 4.3 Physical Address

**Current:** `HAM Tower, Opposite Makerere University Main Gate, Kampala`

Files to update:

```
apps/site/src/app/layout/components/footer/footer.component.ts      - Line 39
apps/site/src/app/features/contact/contact.component.html           - Google Maps embed (line 275)
apps/site/src/app/layout/components/chatbot/chatbot.component.ts    - Line 117
apps/api/src/modules/shared/services/pdf.service.ts                 - Line 10
```

### 4.4 WhatsApp Links

**Current:** `https://wa.me/256759204449`, `https://wa.me/256791063897`

Search for `wa.me/256` across:

- Footer component
- Contact page
- FAQ section
- Monaer page
- Main layout (floating button)
- Services page
- README.md

---

## 5. Social Media Links

### Current Links to Replace

| Platform  | Current URL                                            |
| --------- | ------------------------------------------------------ |
| Instagram | `https://www.instagram.com/mr.p_authentic_auto_parts/` |
| Facebook  | `https://facebook.com/mrpauthenticautoparts`           |
| TikTok    | `https://www.tiktok.com/@mr.p_authentic_autoparts`     |
| Twitter/X | `https://x.com/Mrp_AutoSpares`                         |
| YouTube   | `https://youtube.com/@mrpauthenticautoparts`           |

Files to update:

```
apps/site/src/app/layout/components/footer/footer.component.ts   - Lines 24-34
README.md                                                        - Lines 65-69
```

---

## 6. Email & PDF Templates (API)

These files contain hardcoded company branding in generated documents:

### 6.1 PDF Service (Invoices/Receipts)

**File:** `apps/api/src/modules/shared/services/pdf.service.ts`

```typescript
private readonly companyName = 'MR P Authentic Auto Parts';  // Line 9
private readonly companyAddress = 'Kampala, Uganda';          // Line 10
private readonly companyPhone = '+256 791 063 897 / +256 759 204 449';  // Line 11
```

### 6.2 Report PDF Service

**File:** `apps/api/src/modules/reports/services/report-pdf.service.ts`

- Line 57: Header text
- Line 160: Footer text
- Line 394: Header text (duplicate)

### 6.3 Purchase Order PDF Service

**File:** `apps/api/src/modules/procurement/services/purchase-order-pdf.service.ts`

- Line 55: Header text
- Line 132: Company name in details
- Line 339: Footer text

### 6.4 Email Service

**File:** `apps/api/src/modules/shared/services/email.service.ts`

- Line 112: Receipt email signature
- Lines 183, 193: Contact confirmation emails

### 6.5 Sales Controllers (Email subjects)

```
apps/api/src/modules/sales/controllers/sales.controller.ts            - Lines 125-126
apps/api/src/modules/sales/controllers/sales-payments.controller.ts   - Lines 128-129
```

### 6.6 Orders Service (Order status emails)

**File:** `apps/api/src/modules/orders/orders.service.ts`

- Lines 653, 693, 714, 738: Order confirmation/status emails

---

## 7. SEO & Metadata

### 7.1 Site Index HTML

**File:** `apps/site/src/index.html`

Update:

- `<title>` (line 6)
- Meta description (line 15-16)
- Meta keywords (line 17-18)
- Meta author (line 19)
- Open Graph tags (lines 23-30)
- Twitter cards (lines 32-38)
- Canonical URL (line 49)

### 7.2 SEO Service

**File:** `apps/site/src/app/core/services/seo.service.ts`

- Line 31: Default keywords
- Line 150: Structured data (telephone, etc.)

### 7.3 Route Metadata

**File:** `apps/site/src/app/app.routes.ts`

- Lines 28, 60, 83: Route-specific SEO descriptions

---

## 8. Industry-Specific Content

If changing the business type (not auto parts), update these:

### 8.1 About Page

**File:** `apps/site/src/app/features/about/about.component.ts` and `.html`

Contains the company story, mission, vision - needs complete rewrite.

### 8.2 Monaer Section (Brand Partnership)

This is specific to the auto parts business:

```
apps/site/src/app/features/monaer/          - Entire component
apps/site/src/app/features/home/sections/monaer-section.component.*
```

Consider: Remove or replace with your brand partnerships.

### 8.3 Store/Product Content

**Files:**

```
apps/site/src/app/features/store/store.component.ts   - Line 90 (SEO)
apps/site/src/app/features/store/store.component.html - Line 5 (subtitle)
```

### 8.4 Services Page

**File:** `apps/site/src/app/features/services/`

Update with your business's services.

---

## 9. Deployment Configuration

### 9.1 Deploy Guide

**File:** `deploy.md`

Update:

- Database names (`mrp_db`, `mrp_user`)
- Nginx configuration (domain names)
- PM2 process names (`mrp-api`, `mrp-site-ssr`)
- SSL certificate domains

### 9.2 Environment Files

```
apps/site/src/environments/environment.prod.ts   - API URL
apps/api/.env (if exists)                        - Various settings
```

---

## 10. Recommended Approach

### Phase 1: Configuration (Recommended Enhancement)

Before making changes, consider creating a centralized configuration:

```typescript
// libs/config/branding.config.ts
export const BRANDING = {
  company: {
    name: 'Your Company Name',
    shortName: 'YCN',
    tagline: 'Your tagline here',
    description: 'Company description',
  },
  contact: {
    phones: ['+1 555 123 4567'],
    email: 'info@yourcompany.com',
    address: '123 Main St, City, Country',
    whatsapp: '15551234567',
  },
  social: {
    instagram: 'https://instagram.com/yourcompany',
    facebook: 'https://facebook.com/yourcompany',
    twitter: 'https://twitter.com/yourcompany',
    // ...
  },
  colors: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    secondary: '#10B981',
  },
};
```

### Phase 2: Find & Replace

Use these commands to find all instances:

```bash
# Find company name references
grep -rn "Mr P" apps/ --include="*.ts" --include="*.html" --include="*.scss"
grep -rn "mrp" apps/ --include="*.ts" --include="*.html" --include="*.json"

# Find phone numbers
grep -rn "256" apps/ --include="*.ts" --include="*.html"

# Find email references
grep -rn "@mrpauthenticautoparts" .
```

### Phase 3: Asset Replacement

1. Design new logo (recommended: SVG for scalability)
2. Generate favicon set (use realfavicongenerator.net)
3. Replace all logo files
4. Update any branded images

### Phase 4: Content Rewrite

1. Rewrite About page content
2. Update Home page sections
3. Modify product categories if needed
4. Update SEO keywords for new industry

### Phase 5: Testing

1. Build all apps and check for broken references
2. Test PDF generation (invoices, receipts, reports)
3. Test email sending
4. Verify all pages render correctly
5. Check mobile responsiveness
6. Validate SEO meta tags

---

## 11. Removing Industry-Specific Features

If you are adapting this system for a **non-automotive business**, the following features need to be removed or significantly modified. This section provides detailed instructions for each.

---

### 11.1 Service Bookings Module (Auto Service Appointments)

This feature allows customers to book vehicle repair/service appointments. **Remove entirely** if not applicable to your business.

#### API Backend

**Directory to delete:** `apps/api/src/modules/service-bookings/`

Contents:

```
apps/api/src/modules/service-bookings/
├── admin-service-bookings.controller.ts
├── admin-service-bookings.service.ts
├── service-bookings.controller.ts
├── service-bookings.service.ts
├── service-bookings.module.ts
├── dto/
│   ├── admin-service-booking.dto.ts
│   ├── create-service-booking.dto.ts
│   └── index.ts
└── entities/
    └── service-booking.entity.ts
```

**Files to modify:**

| File                                                 | Action                                    |
| ---------------------------------------------------- | ----------------------------------------- |
| `apps/api/src/app.module.ts`                         | Remove `ServiceBookingsModule` import     |
| `apps/api/src/config/database.config.ts`             | Remove `ServiceBooking` entity reference  |
| `apps/api/src/modules/roles/entities/role.entity.ts` | Remove booking-related permissions if any |

**Migration to handle:**

```
apps/api/src/migrations/1769758201173-add-service-booking.ts
```

Create a down migration to drop the `service_bookings` table.

#### Admin Dashboard

**Directory to delete:** `apps/admin/src/app/features/service-bookings/`

Contents:

```
apps/admin/src/app/features/service-bookings/
├── service-bookings.routes.ts
├── models/
│   └── service-booking.model.ts
├── services/
│   └── service-bookings.service.ts
└── pages/
    ├── bookings-list/
    ├── booking-form/
    └── booking-details/
```

**Files to modify:**

| File                                                                                           | Action                              |
| ---------------------------------------------------------------------------------------------- | ----------------------------------- |
| `apps/admin/src/app/app.routes.ts`                                                             | Remove service-bookings route       |
| `apps/admin/src/app/layout/components/sidebar/sidebar.component.ts`                            | Remove "Service Bookings" menu item |
| `apps/admin/src/app/core/services/sidebar-badge.service.ts`                                    | Remove booking badge logic          |
| `apps/admin/src/app/features/customers/pages/customer-details/customer-details.component.ts`   | Remove booking references           |
| `apps/admin/src/app/features/customers/pages/customer-details/customer-details.component.html` | Remove booking tab/section          |

#### Customer Site

**Directory to delete:** `apps/site/src/app/features/account/pages/book-service/`
**Directory to delete:** `apps/site/src/app/features/account/pages/service-bookings/`

**Files to delete:**

```
apps/site/src/app/features/account/models/service-booking.model.ts
apps/site/src/app/features/account/services/service-bookings.service.ts
```

**Files to modify:**

| File                                                                                  | Action                                             |
| ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `apps/site/src/app/app.routes.ts`                                                     | Remove booking routes                              |
| `apps/site/src/app/features/account/components/sidebar/account-sidebar.component.ts`  | Remove "Book Service" and "My Bookings" menu items |
| `apps/site/src/app/features/account/pages/dashboard/account-dashboard.component.ts`   | Remove booking stats/widgets                       |
| `apps/site/src/app/features/account/pages/dashboard/account-dashboard.component.html` | Remove booking UI sections                         |

---

### 11.2 Customer Vehicles Module

This feature allows customers to register their vehicles for service tracking. **Remove entirely** if not applicable.

#### API Backend

**Files to delete:**

```
apps/api/src/modules/customers/dto/create-vehicle.dto.ts
apps/api/src/modules/customers/dto/update-vehicle.dto.ts
apps/api/src/modules/customers/entities/vehicle.entity.ts
apps/api/src/modules/customers/services/vehicles.service.ts
```

**Files to modify:**

| File                                                                        | Action                                 |
| --------------------------------------------------------------------------- | -------------------------------------- |
| `apps/api/src/modules/customers/customers.module.ts`                        | Remove VehiclesService, Vehicle entity |
| `apps/api/src/modules/customers/controllers/customer-account.controller.ts` | Remove vehicle endpoints               |
| `apps/api/src/modules/customers/controllers/customers.controller.ts`        | Remove vehicle-related operations      |
| `apps/api/src/modules/customers/entities/customer.entity.ts`                | Remove `vehicles` relation             |
| `apps/api/src/config/database.config.ts`                                    | Remove Vehicle entity                  |

**Database:** Create migration to drop `vehicles` table and related foreign keys.

#### Customer Site

**Directory to delete:** `apps/site/src/app/features/account/pages/vehicles/`

**Files to delete:**

```
apps/site/src/app/features/account/models/vehicle.model.ts
apps/site/src/app/features/account/services/customer-vehicles.service.ts
```

**Files to modify:**

| File                                                                                  | Action                                        |
| ------------------------------------------------------------------------------------- | --------------------------------------------- |
| `apps/site/src/app/app.routes.ts`                                                     | Remove vehicles route                         |
| `apps/site/src/app/features/account/components/sidebar/account-sidebar.component.ts`  | Remove "My Vehicles" menu item                |
| `apps/site/src/app/features/account/pages/dashboard/account-dashboard.component.ts`   | Remove vehicle stats                          |
| `apps/site/src/app/features/account/pages/dashboard/account-dashboard.component.html` | Remove vehicle widget                         |
| `apps/site/src/app/features/account/pages/book-service/book-service.component.ts`     | If keeping bookings, remove vehicle selection |

---

### 11.3 Monaer Partnership Pages (Brand-Specific)

This is a brand partnership page specific to automotive parts. **Remove entirely.**

#### Customer Site

**Directory to delete:** `apps/site/src/app/features/monaer/`

Contents:

```
apps/site/src/app/features/monaer/
├── monaer.component.html
├── monaer.component.scss
└── monaer.component.ts
```

**Home Page Section to delete:** `apps/site/src/app/features/home/sections/monaer-section.component.*`

**Files to modify:**

| File                                                               | Action                                  |
| ------------------------------------------------------------------ | --------------------------------------- |
| `apps/site/src/app/app.routes.ts`                                  | Remove `/monaer` route (around line 83) |
| `apps/site/src/app/features/home/home.component.ts`                | Remove MonaerSectionComponent import    |
| `apps/site/src/app/layout/components/header/header.component.ts`   | Remove "Monaer" nav link                |
| `apps/site/src/app/layout/components/header/header.component.html` | Remove "Monaer" menu item               |
| `apps/site/src/app/layout/components/footer/footer.component.html` | Remove monaer references if any         |

**SEO references to remove:**

```
apps/site/src/index.html              - Remove "monaer" from keywords (line 18)
apps/site/src/app/core/services/seo.service.ts - Remove "monaer" from default keywords (line 31)
```

---

### 11.4 Services Page (Auto Repair Services)

This page lists vehicle repair/maintenance services. **Remove or repurpose for your business.**

#### Customer Site

**Directory:** `apps/site/src/app/features/services/`

**Option A - Remove entirely:**

- Delete the entire `services/` directory
- Remove route from `apps/site/src/app/app.routes.ts`
- Remove from header navigation
- Remove from footer links

**Option B - Repurpose:**

- Rewrite `services.component.html` with your business services
- Update `services.component.ts` with relevant service data
- Keep the route but change content

---

### 11.5 Auto Parts Specific Content

These files contain automotive-specific language that should be updated or removed:

#### Site Components

| File                                                                     | Content to Change                                  |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| `apps/site/src/app/features/about/about.component.html`                  | Story about auto parts business, European vehicles |
| `apps/site/src/app/features/about/about.component.ts`                    | SEO metadata about auto parts                      |
| `apps/site/src/app/features/store/store.component.html`                  | "Premium genuine European auto parts catalog"      |
| `apps/site/src/app/features/store/store.component.ts`                    | Auto parts SEO keywords                            |
| `apps/site/src/app/features/home/sections/hero-section.component.html`   | Auto parts messaging                               |
| `apps/site/src/app/features/home/sections/about-section.component.html`  | "premium auto parts" text                          |
| `apps/site/src/app/features/home/sections/brands-section.component.html` | Vehicle manufacturer logos/names                   |
| `apps/site/src/app/features/home/sections/faq-section.component.ts`      | Auto parts FAQs                                    |
| `apps/site/src/app/layout/components/chatbot/chatbot.component.ts`       | Auto parts chatbot responses                       |

#### SEO Keywords to Replace

**Current automotive keywords:**

```
auto parts, car parts, European auto parts, BMW parts, Mercedes parts,
Audi parts, monaer, genuine parts, authentic auto parts
```

**Found in:**

- `apps/site/src/index.html` (line 17-18)
- `apps/site/src/app/core/services/seo.service.ts` (line 31)
- `apps/site/src/app/features/store/store.component.ts`
- `apps/site/src/app/features/about/about.component.ts`

---

### 11.6 Removal Checklist

Use this checklist when removing industry-specific features:

```
[ ] Service Bookings
    [ ] Delete API module directory
    [ ] Remove from app.module.ts
    [ ] Create down migration for database
    [ ] Delete admin feature directory
    [ ] Remove from admin routes and sidebar
    [ ] Delete site feature pages
    [ ] Remove from site routes and account sidebar

[ ] Customer Vehicles
    [ ] Delete API DTOs, entity, and service
    [ ] Update customers module
    [ ] Remove from customer entity relations
    [ ] Create down migration
    [ ] Delete site feature pages
    [ ] Remove from site routes and sidebar

[ ] Monaer Partnership
    [ ] Delete site monaer component directory
    [ ] Delete home page monaer section
    [ ] Remove from routes
    [ ] Remove from navigation
    [ ] Remove from SEO keywords

[ ] Services Page (if removing)
    [ ] Delete services component directory
    [ ] Remove from routes
    [ ] Remove from navigation

[ ] Update Content
    [ ] Rewrite about page
    [ ] Update hero section messaging
    [ ] Replace chatbot responses
    [ ] Update FAQ content
    [ ] Change SEO keywords
    [ ] Update email templates in API
```

---

### 11.7 Database Cleanup Migration

After removing features, create a migration to clean up the database:

```typescript
// apps/api/src/migrations/XXXXXX-remove-automotive-features.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAutomotiveFeatures implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop service_bookings table
    await queryRunner.query(`DROP TABLE IF EXISTS "service_bookings" CASCADE`);

    // Drop vehicles table
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicles" CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate tables if needed (optional)
  }
}
```

---

## Quick Reference: All Files to Modify

```
Root:
├── README.md
├── package.json
├── agents.md
├── deploy.md

apps/api:
├── package.json
├── src/main.ts
├── test/app.e2e-spec.ts
└── src/modules/
    ├── shared/services/pdf.service.ts
    ├── shared/services/email.service.ts
    ├── reports/services/report-pdf.service.ts
    ├── procurement/services/purchase-order-pdf.service.ts
    ├── orders/orders.service.ts
    └── sales/controllers/*.controller.ts

apps/admin:
├── package.json
├── public/logo.jpg
├── src/index.html
├── src/styles.scss
├── src/styles/_variables.scss
└── src/app/
    ├── app.component.ts
    ├── layout/main-layout.component.html
    └── features/auth/pages/login/login.component.html

apps/site:
├── package.json
├── public/logo.jpg
├── public/favicon.ico
├── src/index.html
├── src/styles.scss
├── src/environments/environment.prod.ts
└── src/app/
    ├── app.routes.ts
    ├── core/services/seo.service.ts
    ├── layout/main-layout.component.html
    ├── layout/components/footer/footer.component.ts
    ├── layout/components/footer/footer.component.html
    ├── layout/components/chatbot/chatbot.component.ts
    ├── features/about/about.component.*
    ├── features/contact/contact.component.*
    ├── features/monaer/monaer.component.*
    ├── features/store/store.component.*
    ├── features/services/services.component.*
    └── features/home/sections/*.component.*
```

---

## Notes

- Always backup before making bulk changes
- Test thoroughly after each phase
- Consider using environment variables for deployment-specific values
- Update this document if you add new branded content
