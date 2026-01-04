# Holochain

Get started as a Holochain Developer

## Requirements

### Docker

You need Docker with Compose v2 support.

- Docker Desktop (recommended on macOS) or Docker Engine
- Docker Compose v2 (`docker compose ...`)

The default dev stack uses these ports on your machine:

- Postgres: `5432`
- Inngest dev server: `8288`

### Bun

This repo expects **Bun v1.3.1**.

- Check: `bun --version`
- Install/upgrade: https://bun.sh

## Quick start (local dev)

1. Create your env file:

```bash
cp example.env .env
```

2. Start the local dependencies (Postgres + Inngest):

```bash
docker compose up -d
```

3. Install dependencies:

```bash
bun install
```

4. Run Prisma migrations and generate the client:

```bash
bun prisma migrate dev
bun prisma generate
```

5. (Optional) Seed the database:

```bash
bun run db:seed
```

6. Start the app:

```bash
bun run dev
```

- App: `http://localhost:5173`
- Inngest Dev UI: `http://localhost:8288`

## Prisma + Postgres

- Prisma is configured via [prisma.config.ts](prisma.config.ts).
- Schema files live in [prisma/models](prisma/models).
- Migrations live in [prisma/migrations](prisma/migrations).
- Prisma Client is generated into [src/lib/generated/prisma](src/lib/generated/prisma).

The app connects to Postgres using `DATABASE_URL` from `.env` (see [example.env](example.env)).

Common commands:

```bash
# Apply migrations locally (creates/updates your dev database)
bun prisma migrate dev

# Generate Prisma Client
bun prisma generate

# Inspect migration status
bun prisma migrate status
```

## Inngest

Inngest runs locally via Docker (see `docker-compose.yaml`). The app exposes Inngest handlers at:

- `GET/POST/PUT http://localhost:5173/api/inngest`

In dev, the Inngest container is started with:

```yaml
inngest dev -u http://host.docker.internal:5173/api/inngest
```

So the Inngest container can call back into your local Vite dev server.

Environment variables used by the app:

- `INNGEST_BASE_URL` (defaults to `http://localhost:8288`)
- `INNGEST_EVENT_KEY` (optional for local dev)
- `INNGEST_SIGNING_KEY` (optional for local dev)
- `INNGEST_INSTANCE_ENV` (used to namespace the Inngest app ID)

## docker-compose overview

The local dev stack is defined in [docker-compose.yaml](docker-compose.yaml):

- `db`
  - Image: `postgres:18`
  - Exposes `5432:5432`
  - Uses a named volume `db_data` for persistence
  - Credentials/database name are set via `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

- `inngest`
  - Image: `inngest/inngest`
  - Exposes `8288:8288`
  - Runs `inngest dev` and points at the app’s `/api/inngest` endpoint
