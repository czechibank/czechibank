# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Czechibank is a full-stack banking simulation built with Next.js 15 (App Router), TypeScript, and PostgreSQL. It uses pnpm as its package manager and requires Node ~20.19.5.

## Common Commands

```bash
# Development
pnpm install                  # Install dependencies
docker compose up -d          # Start local PostgreSQL (port 1111)
pnpm run db:prepare           # Generate Prisma client + run migrations
pnpm run dev                  # Start dev server (turbopack)

# Testing
pnpm run test:unit            # Unit tests (vitest tests/unit/)
pnpm run test:api             # API integration tests (vitest tests/api/)
pnpm run test:e2e             # BDD/E2E tests (playwright-bdd + playwright)
vitest tests/unit/errors.test.ts      # Run a single test file
vitest tests/api/user.api.test.ts     # Run a single API test

# Code quality
pnpm run lint                 # ESLint
pnpm run format               # Prettier (also runs via lint-staged on commit)

# Database
pnpm run db:seed:users        # Seed test users
pnpm run db:seed:features     # Seed feature flags
npx prisma migrate dev        # Create new migration
npx prisma studio             # Database GUI

# Build & deploy
pnpm run build                # prisma generate + next build
pnpm run start                # Start production server
```

## Architecture

### Domain-Driven Service/Repository Pattern

```
API Route (src/app/api/v1/...) → Service (src/domain/...) → Repository → Prisma/DB
```

- **API routes** live in `src/app/api/v1/` — each resource has its own directory (bank-account, transactions, user, apikey, features)
- **Domain layer** in `src/domain/` — each domain has a service, repository, helpers, and Zod schemas (e.g., `ba-service.ts`, `ba-repository.ts`, `ba-schema.ts`)
- **Shared utilities** in `src/lib/` — database client, error types, response helpers, auth client, permissions

### Error Handling with neverthrow

Services use `ResultAsync<T, AppError>` from neverthrow. Methods come in two forms:

- `xxxResult()` — returns `ResultAsync`, used by API routes, converted via `toApiResponse()` or `toPaginatedApiResponse()`
- `xxx()` — returns `Promise<SuccessResponse | ErrorResponse>`, used by server components

Error codes are defined in `src/lib/errors.ts` and map to HTTP status codes via `src/lib/api-error-status-map.ts`.

### Standardized API Response Format

All API responses follow a consistent envelope: `{ success, message, data, meta }` for success, `{ success, message, error: { code, message, details }, meta }` for errors. Response helpers are in `src/lib/response.ts` and `src/lib/result-helpers.ts`.

### Authentication

Uses Better-Auth (`auth.ts` at project root) with:

- Email/password authentication
- Session-based auth (30min expiry, 5min refresh)
- API key support via `X-API-Key` header
- Role-based access control (admin/user) via `src/lib/permissions.ts`
- Auto-creates a BankAccount when a user signs up (via Better-Auth hook)

### Frontend

- React 19 with Server Components, shadcn/ui components in `src/components/ui/`
- Tailwind CSS with dark mode (next-themes)
- Path alias: `@/` maps to `src/`

### Database

- PostgreSQL 14.1 (local via docker-compose on port 1111)
- Prisma ORM — schema in `prisma/schema.prisma`
- Key models: User, BankAccount, Transaction, Session, Apikey, Feature
- Currency enum: CZECHITOKEN, CZK, USD

### Testing

- **Unit tests** (`tests/unit/`): Vitest, pure logic tests
- **API tests** (`tests/api/`): Vitest, real HTTP calls against running server
- **BDD tests** (`tests/bdd-tests/`): Playwright-BDD with Gherkin `.feature` files
- **Performance tests** (`tests/performance/`): k6 load testing

### CI/CD

GitHub Actions (`.github/workflows/test.yml`): builds, migrates, seeds, runs unit + API + E2E tests against a PostgreSQL 16 service container. Husky + lint-staged run Prettier on pre-commit.
