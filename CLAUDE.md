# Czechibank

Teaching app for Czechitas API testing courses. Testers hit the public API with API keys,
report bugs as GitHub issues, and the small dev team fixes them. Keep the API stable and
the error responses precise; that is what students learn from.

## Stack and commands

Next.js 15 (app router), Prisma + PostgreSQL, Better-Auth, shadcn/ui, Tailwind, neverthrow.

- Use `pnpm`, never `npm`.
- `docker compose up -d` starts Postgres. `pnpm db:prepare` generates the client and migrates.
- `pnpm dev` seeds feature flags and starts the dev server on port 3000.
- `pnpm lint`, `pnpm format` (prettier runs on commit via husky).
- Tests:
  - `pnpm test:unit` runs vitest over `tests/unit/` (no server needed).
  - `pnpm test:api` runs vitest over `tests/api/` and needs the app running on port 3000 with a seeded DB (`pnpm db:seed:users && pnpm db:seed:features`). Without a server it fails with ECONNREFUSED.
  - `pnpm test:e2e` runs `bddgen` then Playwright over `tests/bdd-tests/features/*.feature` with steps in `tests/bdd-tests/steps/`. Needs the full stack.
- CI (`.github/workflows/test.yml`) builds the app with Postgres and seed data, so API and e2e tests run there for every PR.

## Layout

- `src/app/api/v1/<resource>/route.ts` are the API routes. Swagger comments above each handler feed `/api/docs`.
- `src/domain/<name>-domain/` holds business logic: `*-service.ts` (logic), `*-repository.ts` (Prisma), `*-schema.ts` (zod), `*-action.ts` (server actions).
- `src/lib/errors.ts`, `src/lib/result-helpers.ts`, `src/lib/response.ts` are the error and response foundation. Read them before touching any route or service.
- `src/app/(app)/` are the signed-in pages, `src/components/` the UI.

## Error handling with neverthrow

Every service exposes `*Result()` methods returning `ResultAsync<T, AppError>`. That is the
primary API. Legacy wrapper methods without the suffix call `toServiceResponse()` and exist only
for older web components; do not add new ones.

- Build errors with the constructors in `src/lib/errors.ts` (`notFound`, `validationError`, `forbidden`, ...). Never throw from a service.
- Wrap caught unknowns with `fromUnknown(error)`.
- Validate input with `validateWithResult(schema, data)`.
- Routes: `authenticateRequest(request).andThen((user) => service.doThingResult(...))`, then `toApiResponse(result, "message", status)`. Use `toPaginatedApiResponse` when the result carries pagination.
- `authenticateRequest` returns a `ResultAsync` synchronously, so it lives in `src/app/api/v1/auth.ts`, which has no `"use server"` directive.

## The "use server" rule

`src/app/api/v1/server-actions.ts` starts with `"use server"`. Every export there must be an
`async` function. Never export a sync helper, a constant, or a type from that file; put those
in `lib.ts` or `auth.ts`.

## Working on bugs

1. Reproduce first, ideally through the API (`curl` with `X-API-Key`), and write the failing test before the fix. API tests go in `tests/api/`, pure logic in `tests/unit/`, user flows as a Gherkin scenario in `tests/bdd-tests/features/`.
2. Commit and push the failing test on its own so CI shows red, then commit the fix so CI shows green.
3. Keep the fix small. If the change outside `tests/` grows past roughly 200 lines, stop and explain why in the issue instead of pushing a large PR.
4. Branch names: `ai/<issue-number>-<slug>` for agent-authored fixes, `feat/`, `fix/` for humans. `develop` is protected; everything goes through a PR reviewed by a person.

## Working on features

Feature work starts from a GitHub issue, not from code. The flow is grill the requirements
(`/grill-me`), write the spec and Gherkin scenarios (`/feature-planner`), then implement
test-first (`/tdd`). Large issues are epics: run `/write-a-prd` and `/prd-to-issues` to cut
them into vertical slices first, one `.feature` file per slice.

Gherkin scenarios belong in `tests/bdd-tests/features/`, step definitions in
`tests/bdd-tests/steps/`. Tag scenarios with `@CZBANK-<n>` matching the issue number.

## Things that bite

- Feature flags live in the DB and are seeded by `pnpm db:seed:features`; `increaseTimeInSendingTransactions` adds a 5s delay to transfers on purpose.
- The donation account `555555555555/5555` is special-cased in the transaction service.
- Better-Auth error codes are mapped to `ApiErrorCode` in `src/lib/errors.ts`; add new ones there, not inline.
- `.playwright-mcp/` and Playwright reports are local artifacts, do not commit them.
- The pre-commit hook (lint-staged) runs `npm run format`, which is `prettier --write .` over the whole tree, so a commit can leave unrelated files modified in your working copy. Check `git status` after committing and discard what you did not touch.
- CI runs only on pushes to `develop` and on PRs targeting it. A pushed `ai/*` or `feat/*` branch gets no run until a PR (draft is enough) exists.
