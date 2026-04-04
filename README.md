# Mr P Authentic Auto Parts

A premium auto parts supplier specializing in genuine European vehicle parts.

## Monorepo Structure

```
├── apps/
│   ├── api/          # NestJS Backend API
│   ├── admin/        # Angular Admin SPA
│   └── site/         # Angular SSR Customer Site
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   ├── ui/           # Shared Angular components
│   └── config/       # Shared configuration
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## Getting Started

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Or start individual apps
pnpm dev:api      # NestJS API on :3000
pnpm dev:admin    # Angular Admin on :4200
pnpm dev:site     # Angular Site on :4000
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in parallel |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run tests |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Remove node_modules and build artifacts |

## Adding Dependencies

```bash
# Add to specific app
pnpm --filter @mrp/api add <package>
pnpm --filter @mrp/admin add <package>

# Add to root (dev dependencies)
pnpm add -D -w <package>
```

## License

Proprietary - All rights reserved.

https://www.instagram.com/mr.p_authentic_auto_parts/
https://facebook.com/mrpauthenticautoparts
https://www.tiktok.com/@mr.p_authentic_autoparts
https://x.com/Mrp_AutoSpares
https://youtube.com/@mrpauthenticautoparts
info@mrpauthenticautoparts.com
https://wa.me/256759204449
