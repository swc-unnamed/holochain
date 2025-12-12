# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A SvelteKit application using Svelte 5, built with Bun runtime and deployed with svelte-adapter-bun.

The application is a star wars themed online marketplace and auction house for a game called Star Wars Combine.

Star Wars Combine has an API, which documentation can be found at https://www.swcombine.com/ws/v2.0/developers/index.php

The idea behind the application is a Holochain, a play on the Blockchain and is role played as if the user is connecting
to the app from a terminal on a space ship.

The application features:

- an auction house system with real-time capabilities and background task processing
- marketplace where users can sell assets
- organizations so that organizations can setup their own marketplace / auction house
- individual "hubs" where users can track assets and stock levels and where other users can purchase items from them
- much more that hasn't come up yet

## Development Commands

### Running the Application

- `bun run dev` - Start development server with Vite (uses Bun runtime, hosts on all interfaces)
- `bun run build` - Build for production
- `bun run preview` - Preview production build

### Code Quality

- `bun run check` - Type check with svelte-check (runs svelte-kit sync first)
- `bun run check:watch` - Type check in watch mode
- `bun run format` - Format code with Prettier
- `bun run lint` - Run both Prettier check and ESLint

### Database

- `bun --env-file=.env ./prisma/seed/seed.ts` - Seed database with entities and admin user
- Database migrations are stored in `prisma/migrations/`
- Prisma schema split across multiple files in `prisma/models/`
- Generated Prisma client outputs to `src/lib/generated/prisma/`

## Architecture

### SvelteKit Configuration

- **Adapter**: svelte-adapter-bun (outputs to `build/`)
- **Experimental Features**:
  - `async` compiler option enabled
  - `remoteFunctions` enabled in kit config

### Database Layer

- **Prisma**: PostgreSQL database with multi-file schema in `prisma/models/`
- **Connection**: Uses `@prisma/adapter-pg` with PrismaPg adapter
- **Client**: Singleton pattern in `src/lib/db/prisma.ts`
- Generated client in `src/lib/generated/prisma/` (not `node_modules/.prisma/client`)

### Authentication

- Session-based auth using JWT stored in `um_session` cookie
- Auth handled in `src/hooks.server.ts` - redirects to `/auth/login` if not authenticated
- Bypasses auth for `/api` and `/auth` routes
- Current user available in `event.locals.user` (type defined in `src/app.d.ts`)
- Password hashing via `src/lib/utils/encryption/hash.ts`

### Remote Functions (Command Pattern)

SvelteKit's experimental remote functions feature is used extensively for server-side mutations:

- Located in `src/lib/remote/` organized by domain
- Each remote function has a `.remote.ts` file and `.schema.ts` file
- Import from `$app/server` and use `command(schema, async (data) => {...})` pattern
- Client-side: use `CommandForm()` utility from `@akcodeworks/svelte-command-form`
- `CommandForm` provides reactive form state, validation, errors, submission handling, and cache invalidation

### Background Tasks

**Inngest** is used for background job processing:

- Event-driven task system in `src/lib/inngest/`
- Client initialized in `src/lib/inngest/client.ts` with app ID and event schemas
- Event functions/handlers organized by domain in `src/lib/inngest/`
- Inngest endpoint at `/api/inngest` serves webhooks
- Docker Compose runs Inngest dev server on port 8288
- Dev server connects to app at `http://host.docker.internal:5173/api/inngest`
- Inngest MCP server runs at `http://127.0.0.1:8288/mcp` which starts when you run `docker compose up -d`

### Routes Structure

- `src/routes/(app)/` - Authenticated app routes with layout
- `src/routes/auth/` - Authentication pages (login, callback)
- `src/routes/api/` - API endpoints (e.g., Inngest webhook)
- Main navigation defined in `src/lib/components/layout/routes.ts`
- Role-based access control via `role` field in navigation routes

### Application Domains

- **Auction House**: Auctions, lots, lot items, bidding system
  - Routes: `/auction-house/auctions`, `/auction-house/lots`, `/auction-house/config`
  - Remote functions in `src/lib/remote/auction-house/`
- **Holochain**: Database/entity management and transaction system
  - Routes: `/holochain/database`, `/holochain/transactions`
- **Admin**: User management, config, admin tools
  - Routes: `/admin`, `/admin/accounts`, `/admin/config`
  - Role-restricted (DEVELOPER, TZAR)

### UI Components

- **shadcn-svelte components**: Located in `src/lib/components/ui/`
- **Custom components**: Located in `src/lib/components/custom/`
  - Custom form fields in `src/lib/components/custom/fields/`
  - Responsive dialog, file drop zone, mode toggle, etc.
- **Styling**: Tailwind CSS 4.x with custom plugins (@tailwindcss/forms, @tailwindcss/typography)

### User System

- User type defined globally in `src/app.d.ts`
- Roles: AppRole enum (DEVELOPER, TZAR, AUCTIONEER, SELLER, BIDDER, etc.)
- User preferences stored as separate UserPreference records
- Anonymous ID (anonid) for privacy features
- Avatar generation via @dicebear packages

## Docker Setup

`docker-compose.yaml` includes:

- **PostgreSQL**: Port 5432, database `holochaindb`
- **Inngest**: Dev server on port 8288, connects to app at `http://host.docker.internal:5173/api/inngest`

## Environment Variables

Required environment variables (check actual `.env` file):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `NODE_ENV` - Environment (development/production)
- `SUPER_ADMIN_PASSWORD` - Password for seeded admin user (um_admin)

## Code Patterns

### Svelte 5 Runes

Uses Svelte 5 with runes syntax:

- `$state()`, `$derived()`, `$effect()` instead of legacy reactive declarations
- TypeScript throughout with strict type checking

### Data Fetching

- Load data in `+page.server.ts` or `+layout.server.ts` files
- Use remote functions via `commandForm` for mutations
- Query state management in `src/lib/remote/query-state/`

### Form Handling

Standard pattern for forms with validation:

1. Define Zod schema in `.schema.ts`
2. Create remote command in `.remote.ts`
3. Use `commandForm(schema, { command, onSuccess, invalidate })` in component
4. Access `form`, `errors`, `submitting`, `result` from commandForm
5. Call `submit()` to execute

### Database Queries

- Import `db` from `$lib/db/prisma`
- Use generated Prisma client types from `$lib/generated/prisma/`
- Follow Prisma best practices for queries and mutations

## Key Dependencies

- **Runtime**: Bun (not Node.js)
- **Framework**: SvelteKit with Svelte 5
- **Database**: PostgreSQL via Prisma with PrismaPg adapter
- **UI**: shadcn-svelte, bits-ui, Tailwind CSS 4.x
- **Forms**: Zod validation, Formsnap, custom commandForm utility
- **Background Jobs**: Inngest
- **Date/Time**: date-fns, @internationalized/date
- **Charts**: layerchart
- **Tables**: @tanstack/table-core

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
