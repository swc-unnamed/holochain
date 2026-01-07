# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Holochain is a SvelteKit application built with Bun runtime, featuring Prisma for database management, Inngest for background jobs, and integrates with the SWCombine API. The app uses Tailwind CSS, TypeScript, and experimental SvelteKit features including remote functions and server tracing.

## Development Commands

### Setup
```bash
# Copy environment file
cp example.env .env

# Start Docker services (Postgres + Inngest)
docker compose up -d

# Install dependencies
bun install

# Run migrations and generate Prisma client
bun prisma migrate dev
bun prisma generate

# Seed database (optional)
bun run db:seed
```

### Development
```bash
# Start dev server (http://localhost:5173)
bun run dev

# Type checking
bun run check
bun run check:watch

# Linting and formatting
bun run lint
bun run format

# Build for production
bun run build

# Preview production build
bun run preview
```

### Database Management
```bash
# Apply migrations
bun prisma migrate dev

# Generate Prisma client
bun prisma generate

# Check migration status
bun prisma migrate status

# Seed database
bun run db:seed
```

## Architecture

### Project Structure

- **Prisma Configuration**: Uses multi-file schema split across `prisma/models/*.prisma`
  - Schema files: `auction-house.prisma`, `user.prisma`, `entity.prisma`, `enum.prisma`, `api-client.prisma`, etc.
  - Migrations: `prisma/migrations/`
  - Generated client: `src/lib/generated/prisma/`
  - Configuration: `prisma.config.ts` (not standard `prisma/schema.prisma`)

- **Database Client**: Singleton pattern in `src/lib/db/prisma.ts`
  - Uses `@prisma/adapter-pg` for connection pooling
  - Import with `import { db } from '$lib/db/prisma'`

- **SvelteKit Routes**:
  - `src/routes/(app)/`: Protected app routes requiring authentication
  - `src/routes/api/`: API endpoints with API key authentication
  - `src/routes/auth/`: Public authentication routes

- **Remote Functions**: `src/lib/remote/**/*.remote.ts`
  - Server-side functions called from client using SvelteKit's experimental `command()` API
  - Organized by feature: `auth/`, `account/`, `auction-house/`, `admin/`, `users/`, `query-state/`
  - Pattern: Uses zod schemas for validation (`.schema.ts` files)
  - Example: `import { command } from '$app/server'`

- **Inngest Functions**: `src/lib/inngest/`
  - Background jobs and event handlers
  - Client setup: `src/lib/inngest/client.ts`
  - Functions exported from: `src/lib/inngest/index.ts`
  - API endpoint: `src/routes/api/inngest/+server.ts`
  - Organized by domain: `auction/` (broadcast events, lot sales)

### Authentication & Authorization

- **User Authentication**:
  - Session-based using JWT stored in `um_session` cookie
  - Auth logic in `src/hooks.server.ts` (authHandle hook)
  - User lookup via `getLoggedInUser()` utility
  - Redirects to `/auth/login` if unauthorized
  - Protected routes skip auth for: `/auth/callback`, `/auth/login`, `/api/*`

- **API Key Authentication**:
  - Separate hook (apiAuthHandle) for `/api/*` routes
  - Requires `x-api-key` header
  - Validates against `apiClient` table
  - Checks client status and scopes
  - Logs all API requests with latency tracking
  - Exempt routes: `/api/inngest`, `/api/health`, `/api/metrics`

- **User Object** (`event.locals.user`):
  - Populated by auth hook on every request
  - Type defined in `src/app.d.ts`
  - Fields: `id`, `name`, `displayName`, `role`, `avatarUrl`, `combineId`, `discordId`, `preferences`, `anonid`

### Configuration

- **Adapter**: Uses `svelte-adapter-bun` (not standard Node adapter)
- **Experimental Features** (enabled in `svelte.config.js`):
  - `remoteFunctions: true` - Server functions callable from client
  - `tracing.server: true` - OpenTelemetry tracing
  - `instrumentation.server: true` - Performance monitoring
  - `async: true` - Async compiler option

- **Vite Plugins**:
  - `@sentry/sveltekit` - Error tracking
  - `@tailwindcss/vite` - Tailwind CSS v4
  - `vite-plugin-devtools-json` - Development tools

### Environment Variables

Required variables (see `example.env`):
- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET` - Session token signing
- `ENCRYPTION_KEY` - Data encryption
- `SUPER_ADMIN_PASSWORD` - Admin login
- `INNGEST_BASE_URL` - Inngest server URL
- `INNGEST_INSTANCE_ENV` - Environment namespace for Inngest
- `ORIGIN` - App origin URL
- `COMBINE_CLIENT_ID`, `COMBINE_SECRET_KEY` - SWCombine API credentials

Optional:
- `INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY` - Not required for local dev
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ENV` - Error tracking

## Important Patterns

### Remote Functions
Remote functions allow client-side code to call server-side logic type-safely:

```typescript
// Define in src/lib/remote/feature/action.remote.ts
import { command } from '$app/server';
import { actionSchema } from './action.schema';

export const action = command(actionSchema, async (data) => {
  // Server-side logic with database access
  return result;
});

// Use from client
import { action } from '$lib/remote/feature/action.remote';
const result = await action({ ...data });
```

### Inngest Event-Driven Jobs
Inngest functions respond to events and run background tasks:

```typescript
// Define function
export const myFunction = inngest.createFunction(
  { id: 'my-function' },
  { event: 'app/my.event' },
  async ({ event, step }) => {
    // Background job logic
  }
);

// Register in src/lib/inngest/index.ts
export const functions = [myFunction, ...];

// Trigger from anywhere
await inngest.send({ name: 'app/my.event', data: {...} });
```

### Prisma Multi-Schema Pattern
Schema is split across multiple files in `prisma/models/`:
- Always run `bun prisma generate` after schema changes
- Generated client is at `src/lib/generated/prisma/`
- Import with `import { db } from '$lib/db/prisma'`
- Use the singleton `db` instance, don't create new clients

### Docker Services
Local development requires Docker Compose services:
- **Postgres**: Port 5432, named volume `db_data`
- **Inngest**: Port 8288, connects to app at `http://host.docker.internal:5173/api/inngest`
- Always start with `docker compose up -d` before `bun run dev`
- Inngest Dev UI available at `http://localhost:8288`

## Component Organization

- `src/lib/components/ui/` - Reusable UI components (bits-ui, shadcn-style)
- `src/lib/components/custom/` - App-specific components
- `src/lib/components/layout/` - Layout components
- Uses Tailwind CSS v4, class utilities via `clsx` and `tailwind-merge`
- Svelte 5 with runes syntax
