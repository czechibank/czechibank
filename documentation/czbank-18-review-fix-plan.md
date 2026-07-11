# CZBANK-18 — Review Fix Plan (PR #62)

Step-by-step plan to address all findings from the CodeRabbit review of
[PR #62](https://github.com/czechibank/czechibank/pull/62) plus additional issues found in a
follow-up Claude review that CodeRabbit missed.

Work through the phases in order — Phase 1 items are security holes; the later phases get
progressively less urgent. Each step lists the files to touch, what to change, and how to verify.

Legend: **[CR]** = CodeRabbit finding · **[CC]** = Claude finding (not in CodeRabbit review)

General verification after each phase:

```bash
npm run lint
npm run test:unit
npm run test:api
```

---

## Phase 1 — Security (do these first)

### ✅ 1.1 Remove `"use server"` from the drops repository — [CC] 🔴 critical

- **File:** `src/domain/drops-domain/drops-repository.ts` (line 1)
- **Problem:** The `"use server"` directive turns every exported async function in the file into a
  publicly invokable Next.js Server Action. This is a data-access layer, so `completeInstantMission`,
  `progressAggregateAndMaybeComplete` (both grant Super Tokens with **no auth check**),
  `createMission`, `updateMissionBySlug`, and `deleteMissionBySlug` all become potential POST
  endpoints reachable from the browser, bypassing the admin gates in the route handlers.
- **Fix:** Delete the `"use server"` line. The file is only called from server-side code
  (`drops-service.ts`), so nothing else changes. The directive belongs only on genuine action files
  (`*-action.ts`).
- **Verify:** `npm run build` succeeds; app still works (`npm run dev`, complete a mission via a
  transfer). Grep the repo for other repository/service files wrongly marked `"use server"`:
  `grep -rn '"use server"' src/ | grep -v action`

### ✅ 1.2 Derive the user from the session in server actions — [CR]

- **Files:** `src/domain/bankAccount-domain/bank-account-action.ts`,
  `src/domain/transaction-domain/transaction-action.ts`
- **Problem:** Both actions accept `userId` as a caller-supplied parameter. Server actions are
  client-invokable, so any signed-in user can pass someone else's `userId` — creating accounts or
  sending money as another user.
- **Fix:** Remove `userId` from the action input. Inside the action, resolve the session
  (`userService.server.getSession(await headers())`), reject with an error result if absent, and use
  `session.user.id`. In `sendMoneyToBankNumberAction`, additionally confirm `fromBankNumber`
  belongs to the session user before calling the service (if the service doesn't already enforce it —
  check `transactionService.sendMoneyToBankNumber` and add the ownership check at whichever layer
  fits best).
- **Also update callers:** `src/components/transactions/transfer.tsx`,
  `src/components/bank-account/create-ba-dialog.tsx` (stop passing `userId`).
- **Verify:** UI transfer + account creation still work; a hand-crafted action call with a foreign
  `userId` is no longer possible (parameter gone).

### ✅ 1.3 Gate `bank-account/get-all` behind admin — [CR] — resolved as “intentional, documented”

- **File:** `src/app/api/v1/handlers/bank-account/get-all.handler.ts`
- **Problem:** Any authenticated user can list **all users'** bank accounts.
- **Fix:** Chain `.andThen(requireAdmin)` after `authenticateRequest` (helper already exists in
  `src/app/api/v1/handlers/shared/require-admin.ts`). ⚠️ If exposing all accounts is intentional for
  this training app, skip the code change but say so explicitly in `API.md` and resolve the CodeRabbit
  comment with that rationale instead.
- **Verify:** API test: non-admin key gets 403, admin key gets 200.

---

## Phase 2 — Correctness

### ✅ 2.1 Fix NaN pagination parsing — [CR] + [CC] — only drops needed the fix; bank-account/transactions already validate in their services (422)

- **Files:** `src/app/api/v1/handlers/drops/list.handler.ts`,
  `src/app/api/v1/handlers/bank-account/get-all.handler.ts` (same bug, unclamped),
  check `src/app/api/v1/handlers/transactions/list.handler.ts` too
- **Problem:** `Math.max(1, parseInt("abc"))` is `NaN` — `Math.max` doesn't guard against NaN, so
  `?page=abc` propagates NaN into Prisma `skip`. CodeRabbit also noted `parseInt` accepts `"1abc"` → 1.
- **Fix:** Add a shared helper in `src/app/api/v1/handlers/shared/` (e.g. `parse-pagination.ts`) that
  parses with a strict regex or `Number()`, falls back to the default on non-finite values, and clamps
  (`page ≥ 1`, `1 ≤ limit ≤ 100`). Use it in all list handlers.
- **Verify:** Unit tests in `tests/unit/handler-shared-helpers.test.ts` for `"abc"`, `"1abc"`, `"-5"`,
  `"0"`, `""`, missing param.

### ✅ 2.2 Reject (or implement) unsupported reward types — [CR]

- **Files:** `src/domain/drops-domain/drops-schema.ts`, `src/domain/drops-domain/drops-repository.ts`
  (`grantMissionRewardsTx`)
- **Problem:** `BADGE`, `VAULT_BONUS`, `LOTTERY_ENTRY` are accepted by `CreateDropMissionSchema` but
  `grantMissionRewardsTx` grants nothing for them — a completed mission silently gives no reward.
- **Fix (recommended):** Narrow the create/update schema to the implemented types
  (`SUPER_TOKENS`, `DISPLAY_TITLE`) so unimplemented missions can't be created; keep the Prisma enum
  as-is for forward compatibility. Alternatively implement the missing grants — bigger scope, decide
  with the team.
- **Verify:** API test: `POST /drops` with `rewardType: "BADGE"` returns 400.

### ✅ 2.3 Validate `rewardPayload` against `rewardType` — [CR]

- **File:** `src/domain/drops-domain/drops-schema.ts`
- **Problem:** `rewardPayload` is an untyped `z.record(z.unknown())`. A `SUPER_TOKENS` mission with a
  missing/zero/negative `amount` completes but grants 0 tokens silently.
- **Fix:** Use `superRefine` (or a discriminated union on `rewardType`) on
  `CreateDropMissionSchema`: `SUPER_TOKENS` requires `payload.amount` positive number;
  `DISPLAY_TITLE` requires non-empty `text`/`title` string. Apply the same on update when either
  field is present.
- **Verify:** Unit tests for valid/invalid payload combos; `scripts/seed-missions.ts` still seeds
  cleanly (`npm run db:seed:missions`).

### ✅ 2.4 Require at least one comparator in the `amount` rule — [CR]

- **File:** `src/domain/drops-domain/drops-schema.ts` (`ruleSchema`, amount branch)
- **Problem:** `{ kind: "amount" }` with neither `equals` nor `gte` matches **any** request that has
  an amount.
- **Fix:** `.refine((r) => r.equals !== undefined || r.gte !== undefined, "amount rule needs equals or gte")`.
- **Verify:** Unit test: bare amount rule rejected by `DropDefinitionSchema`.

### ✅ 2.5 Fix case-insensitive regex matching — [CC]

- **File:** `src/domain/drops-domain/drops-rules.ts` (`matchName`)
- **Problem:** For the `regex` op with `caseSensitive: false`, the code lowercases the _pattern
  string_ and also passes the `i` flag. Lowercasing a pattern corrupts escape sequences: `\D`
  (non-digit) becomes `\d` (digit), same for `\W`, `\S`, `\B`.
- **Fix:** For the regex branch, use the original (non-lowercased) pattern values and rely on the
  `i` flag alone. Only lowercase for `eq`/`in`.
- **Verify:** Unit test: pattern `^\D+$`, `caseSensitive: false`, name `"Savings"` → must match.

### ✅ 2.6 Validate regex patterns at mission creation — [CR]

- **Files:** `src/domain/drops-domain/drops-schema.ts`, optionally `drops-rules.ts`
- **Problem:** Patterns are compiled at evaluation time on every matching request; an invalid or
  pathological (ReDoS) pattern is only discovered at runtime. Exposure is admin-only input, so
  severity is low — but validation is cheap.
- **Fix:** In the `bank_account_name` rule schema, when `op === "regex"` refine each value with
  `new RegExp(v)` in a try/catch (reject invalid), and cap pattern length (e.g. 200 chars). Keep the
  existing runtime try/catch as a backstop.
- **Verify:** Unit test: creating a mission with pattern `"("` fails validation.

### ✅ 2.7 Reject empty-string amounts in rule evaluation — [CC]

- **File:** `src/domain/drops-domain/drops-rules.ts` (`getAmount`)
- **Problem:** `Number("")` is `0`, not `NaN`, so an empty-string `amount` in a request body
  evaluates as amount 0 and can satisfy `gte: 0`-style rules.
- **Fix:** In `getAmount`, treat empty/whitespace-only strings as `undefined` before `Number()`.
- **Verify:** Unit test: `requestBody.amount = ""` → rule does not match.

### ✅ 2.8 Make user creation + API key issuance atomic — [CR]

- **File:** `src/app/api/v1/handlers/user/create.handler.ts` (and the services it calls)
- **Problem:** If `createApiKey` fails after `createUser` succeeds, the user exists without an API
  key and the client gets an error — partial state.
- **Fix:** Either wrap both in a single `prisma.$transaction` (add a service-level method that does
  user + key in one transaction), or — smaller change — keep the sequence but make the handler
  tolerate/clean up the partial failure. Prefer the transaction.
- **Verify:** API test for `POST /user/create` happy path; unit test simulating key-creation failure
  leaves no orphan user.

---

## Phase 3 — Robustness & UX

### ✅ 3.1 Make `GamificationHeader` fail soft — [CR]

- **File:** `src/components/gamification/gamification-header.tsx` (rendered from `src/app/layout.tsx`)
- **Problem:** It's a server component in the app shell; if `getSession` or
  `getGamificationSummary` throws, the whole page 500s.
- **Fix:** Wrap the data fetching in try/catch and return `null` on failure (log a warn). Optionally
  wrap the render site in an error boundary / `<Suspense>`.
- **Verify:** Temporarily throw inside `getGamificationSummary` in dev — app shell still renders.

### ✅ 3.2 Self-host celebration GIFs — [CR]

- **Files:** `src/components/gamification/mission-drop-celebration.tsx`,
  `src/components/transactions/transfer.tsx`
- **Problem:** Hotlinking Giphy leaks user IPs/activity to a third party and breaks if the URL dies.
- **Fix:** Download the GIFs (or pick licensed/local ones) into `public/gamification/`, reference
  them with local paths. Check `dev-mission-toast-preview.tsx` for the same URLs.
- **Verify:** Celebration toast shows the local asset with network devtools showing no giphy.com calls.

### ✅ 3.3 Consistent reward labels in toasts — [CR]

- **Files:** `src/components/gamification/mission-drop-celebration.tsx` (and toast callers)
- **Problem:** CodeRabbit flagged inconsistent reward-type labeling in toast notifications.
- **Fix:** Use the existing `rewardTypeLabel()` from `src/domain/drops-domain/drops-format.ts`
  everywhere a reward type is displayed; also dedupe any copy-pasted timestamp formatting into a
  shared helper (CodeRabbit nitpick).
- **Verify:** Visual check of toast + header + profile card labels.

### 3.4 Decide: show SECRET mission completions in `/drops/me`? — [CC]

- **Files:** `src/domain/drops-domain/drops-service.ts` (`getMyDropStatus`),
  `src/domain/drops-domain/drops-repository.ts`
- **Problem:** `getMyDropStatus` only lists `PUBLISHED` missions, so a user who completes a SECRET
  mission never sees that completion in `/drops/me` (it does appear in the gamification summary) —
  inconsistent.
- **Fix:** Product decision. Suggested: include SECRET missions **the user has completed** (union of
  published missions + user's completed missions), keeping uncompleted SECRET ones hidden.
- **Verify:** API test: complete a SECRET mission → it appears in `/drops/me` with `completed: true`.

### ✅ 3.5 `onComplete` hook — document, don't rewrite — [CR, partial pushback]

- **File:** `src/lib/api/with-api-handler.ts`
- **CodeRabbit suggested** running `onComplete` fire-and-forget so it can't add latency or fail the
  response. Pushback: the hook is currently only used for cheap timing/audit, and drop evaluation
  deliberately runs _inside_ the handler (see comment in
  `src/app/api/v1/handlers/shared/evaluate-drops.ts`) because the response needs the `drops` array.
- **Fix (middle ground):** Wrap the `await config.onComplete(...)` in try/catch so a throwing hook
  logs instead of turning a successful response into a 500. Add a JSDoc note that hooks must stay
  fast. Add the missing regression test for a failing hook (CodeRabbit nitpick).
- **Verify:** New case in `tests/unit/with-api-handler.test.ts`: hook throws → response still 200.

---

## Phase 4 — Schema & performance

### 4.1 Add user-leading indexes — [CR]

- **Files:** `prisma/schema.prisma`, new migration
- **Problem:** `DropMissionProgress` / `DropMissionCompletion` only have
  `@@unique([missionId, userId])` — player-centric queries (`findAllProgressByUser`,
  `findAllCompletionsByUser`, run on every page via the header) can't use it efficiently.
- **Fix:** Add `@@index([userId])` to both models, then
  `npx prisma migrate dev --name add_drop_user_indexes`.
- **Verify:** Migration applies cleanly; `npm run db:prepare` on a fresh DB works.

---

## Phase 5 — API spec, docs & tests

### 5.1 OpenAPI fixes — [CR]

- **Files:** `src/lib/swagger.ts`, `src/app/api/v1/drops/[slug]/route.ts`, `src/app/api/v1/drops/route.ts`
- **Fix:**
  - Replace `type: ["string", "null"]` style with `nullable: true` (OpenAPI 3.0 syntax) in `swagger.ts`.
  - Add the `slug` path parameter to the PUT and DELETE operations in `drops/[slug]/route.ts`
    (currently only GET documents it).
  - Add a real request-body schema for `POST /drops` and `PUT /drops/{slug}` instead of the bare
    `type: object` (mirror `CreateDropMissionSchema`).
- **Verify:** Load `/api/doc` (Swagger UI) and check the Drops endpoints render correctly.

### 5.2 Docs cleanup — [CR]

- **Files:** `documentation/time-limited-api-challenges.md`, `API.md`, `scripts/seed-missions.ts`
- **Fix:** Mark unimplemented DSL branches as “future work” or remove them; make seeded mission
  descriptions match their configured rewards and timezones (CodeRabbit found mismatches).
- **Verify:** Read-through; re-run `npm run db:seed:missions`.

### 5.3 Test coverage gaps — [CR nitpicks + regression tests from this plan]

- **Files:** `tests/unit/handler-shared-helpers.test.ts`, `tests/unit/with-api-handler.test.ts`,
  new `tests/unit/drops-rules.test.ts`
- **Add:**
  - `requireAdmin` / `isAdmin` with `role: null` / `role: undefined` (CodeRabbit nitpick).
  - Failing `onComplete` hook (see 3.5).
  - Pagination parser edge cases (see 2.1).
  - Rule-evaluation cases: regex escape sequences (2.5), empty-string amount (2.7),
    comparator-less amount rule rejected (2.4).
- **Verify:** `npm run test:unit` green.

---

## Wrap-up checklist

- [ ] All phases done, `npm run lint && npm run test:unit && npm run test:api` green
- [ ] `npm run build` passes
- [ ] Manual smoke: transfer money → celebration toast, header shows tokens, `/drops/me` correct
- [ ] Reply to / resolve each CodeRabbit comment on PR #62 (link the fixing commit; for 1.3 and 3.5
      post the rationale if you chose the alternative)
- [ ] Re-request CodeRabbit review on the updated PR
