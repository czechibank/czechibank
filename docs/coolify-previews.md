# Coolify PR previews

Every pull request against `develop` gets its own deployment at
`https://<pr-number>.develop.czechibank.ostrava.digital`, built and served by
Coolify (`coolify.ff0000.cz`, application `czechibank:develop`). Wildcard DNS
`*.develop.czechibank.ostrava.digital` points at the Coolify host, Traefik issues
the certificate.

## How a preview starts

Coolify builds the branch with Nixpacks and starts the container with the
command from `nixpacks.toml`: `pnpm start:preview`, which runs
`scripts/preview-start.ts`.

1. The container name is `<app-uuid>-pr-<n>`. The script reads `<n>` from
   `COOLIFY_CONTAINER_NAME` and uses `pr_<n>` as the database name.
2. It connects to the shared preview Postgres (Coolify resource
   `preview-postgres-db`) through the maintenance database and creates
   `pr_<n>` if it does not exist.
3. It rewrites `DATABASE_URL` in-process, runs `prisma migrate deploy`,
   `pnpm db:seed:features` and `pnpm db:seed:users`.
4. It starts `next start`.

Outside a preview container (no `-pr-<n>` in the name) the script only runs
`next start`, so the develop deployment keeps its existing flow (seeds run in
the Coolify post-deployment command, migrations are run by hand).

Seed users and API keys are the same as in CI and local dev, see
`shared/fixtures/users.ts`.

## Coolify configuration

Application `czechibank:develop`, section Preview Deployments:

- Preview deployments: enabled.
- Preview URL template: `{{pr_id}}.develop.czechibank.ostrava.digital`.
- "PR deployments from public contributors": enabled. Without it Coolify
  checks `author_association` from the GitHub webhook and silently skips the
  deployment for members whose org membership is private. The repo is
  private, so fork PRs are not a concern.
- Health check: `/api/health`, with a start period long enough for migrations
  and seeds (about 60 s).

Preview environment variables (separate from the develop set):

| Variable                           | Value                                                               | Note                                        |
| ---------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| `DATABASE_URL`                     | `postgres://postgres:<pw>@d4os84cc8soss0o4o4cogoog:5432/<anything>` | the script replaces the database name       |
| `HOST`                             | `$COOLIFY_FQDN`                                                     | resolved by Coolify at runtime              |
| `BETTER_AUTH_URL`                  | `$COOLIFY_URL`                                                      | resolved by Coolify at runtime              |
| `BETTER_AUTH_SECRET`, `SECRET_KEY` | any 32+ chars                                                       |                                             |
| `ENV`                              | `PROD`                                                              | see the `ENV` gotcha below                  |
| `DISCORD_WEBHOOK_URL`              | empty                                                               | keeps QA traffic out of the Discord channel |

## Gotchas

- `$COOLIFY_FQDN` and `$COOLIFY_URL` are empty during the build; Coolify fills
  them only when the container starts. `src/lib/env.ts` therefore falls back to
  `COOLIFY_FQDN` or `localhost:3000` for `HOST` instead of failing the build.
- Nixpacks runs the build in a login shell (`bash -l`), which exports
  `ENV=/etc/profile`. Our `ENV` variable collides with it, so `src/lib/env.ts`
  ignores values outside `development | CI | PROD`. Renaming the variable to
  `APP_ENV` would remove the collision.
- Coolify has no separate start command for previews, hence `nixpacks.toml`.
- Coolify removes the container when the PR closes, but not the `pr_<n>`
  database. Drop old ones by hand on `preview-postgres-db`:
  `DROP DATABASE "pr_<n>";`

## Debugging a failed preview

The deployment log is in the Coolify UI under the application's Deployments.
From the host it is also in the Coolify database:

```sh
ssh root@176.102.64.236 'docker exec coolify-db psql -U coolify -d coolify -tAc \
  "select id,status,pull_request_id from application_deployment_queues where application_id='"'"'24'"'"' order by id desc limit 5"'
ssh root@176.102.64.236 'docker exec coolify-db psql -U coolify -d coolify -tAc \
  "select logs from application_deployment_queues where id=<id>"'
```

Runtime logs: `docker logs develop-czechibank-ostrava-digital-pr-<n>`.
