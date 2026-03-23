# Time-limited API challenges (“drops”) — architecture proposal

This document translates the product brief into a structure that fits the current Czechibank app. The goal is to keep the system easy to understand, test, and extend, while staying compatible with both:

- the UI
- direct API usage through Postman or scripts

The proposal uses:

- PostgreSQL + Prisma for storage
- JSON mission definitions for flexible rules
- lightweight evaluation after successful API actions

## Goal of the feature

Drop missions turn API usage into a guided learning experience. Users complete specific API actions during a valid time window or under defined conditions, and the system automatically grants rewards such as `SUPER_TOKENS`, badges, or lottery entries.

This supports the product goals you described:

- encourage proactive API usage
- gamify testing and automation
- reward advanced or time-based behavior
- make the app feel more educational, closer to a Duolingo-style challenge system

## How this fits the current Czechibank app

| Area         | Current state                                                                                   | What it means for drops                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| API base     | `/api/v1/...` such as `POST /api/v1/transactions/create` and `POST /api/v1/bank-account/create` | Mission triggers should match these real routes, not placeholder paths from rough examples.                                    |
| “Vaults”     | A vault is currently modeled as `BankAccount` with a `name`                                     | Name-based vault missions can be built on top of `bank-account/create`.                                                        |
| Transactions | Current transaction data includes `amount`, `fromBankNumber`, `toBankNumber`                    | Missions that depend on `message`, `label`, donation tags, or bug-report keywords will need new fields or new endpoints first. |
| Middleware   | `src/middleware.ts` currently handles CORS and analytics                                        | It should stay light. It is not a good place for full mission evaluation.                                                      |
| Users        | Better Auth uses `User.id`                                                                      | Mission progress and completions should always be tied to `userId`.                                                            |

## Important modeling rule

The mission definition and the user’s mission state should be stored separately.

That means:

- one table for the mission itself
- one table for per-user progress
- one table for per-user completion

So the `Mission` row should **not** contain `userId`. A mission is part of the global catalog. The user-specific information belongs in progress and completion records.

---

## Recommended conceptual model

The system can be understood as three layers:

1. **Mission definition**  
   Admins create a reusable mission definition: what action counts, when it is active, and what reward it gives.

2. **Mission evaluation**  
   After a successful API action, the system checks whether that request matches any active mission. If it does, it updates progress or marks the mission as completed.

3. **Mission visibility**  
   Public missions appear in the UI and in a mission calendar API. Secret missions are hidden from listings but still work if the user discovers them.

This gives you one consistent gamification engine that works for both:

- users interacting through the UI
- users interacting directly through the API

## UI and API behavior

If the product should work the same way in the UI and in Postman, then the cleanest approach is:

- the UI performs the same API calls that external users perform
- mission evaluation runs on the backend after those API calls succeed

That gives one clear execution path for everyone. The frontend should not be responsible for deciding whether a mission was completed. The backend should make that decision based on the real request and its successful result.

This is also why heavy business logic should not live in middleware. Middleware is fine for light cross-cutting concerns, but mission evaluation needs access to:

- the authenticated user
- the parsed request payload
- the real business outcome

Those are available much more naturally in route handlers or in shared backend services.

---

## Prisma models (baseline proposal)

```prisma
enum DropVisibility {
  PUBLISHED
  SECRET
}

enum DropRewardKind {
  SUPER_TOKENS
  BADGE
  VAULT_BONUS
  LOTTERY_ENTRY
  COSMETIC_TITLE // e.g. emoji title
}

model DropMission {
  id          String   @id @default(cuid())
  slug        String   @unique // stable id for seeds and API
  name        String
  description String
  visibility  DropVisibility @default(PUBLISHED)

  /// HTTP trigger that should be matched after path normalization
  triggerMethod String   // "POST"
  triggerPath   String   // e.g. "/api/v1/transactions/create"

  /// IANA timezone used for time-based rules
  timezone      String   @default("Europe/Prague")

  /// JSON mission definition: schedule, rule DSL, progress behavior
  definition    Json

  rewardKind    DropRewardKind
  rewardPayload Json?    // e.g. { "amount": 50 }, { "badgeId": "friendly-financier" }
  active        Boolean  @default(true)
  startsAt      DateTime?
  endsAt        DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  progress      DropMissionProgress[]
  completions   DropMissionCompletion[]

  @@index([triggerMethod, triggerPath, active])
  @@map("drop_mission")
}

/// Stores per-user state for missions that need progress over time
model DropMissionProgress {
  id          String   @id @default(cuid())
  missionId   String
  userId      String
  mission     DropMission @relation(fields: [missionId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  /// Flexible state for counters, windows, step progress, distinct recipients, etc.
  state       Json     @default("{}")

  updatedAt   DateTime @updatedAt

  @@unique([missionId, userId])
  @@map("drop_mission_progress")
}

model DropMissionCompletion {
  id          String   @id @default(cuid())
  missionId   String
  userId      String
  mission     DropMission @relation(fields: [missionId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  completedAt DateTime @default(now())
  metadata    Json?    // e.g. proof ids, lottery batch id

  @@unique([missionId, userId])
  @@map("drop_mission_completion")
}
```

The `User` model would also need these relation fields:

```prisma
dropMissionProgress    DropMissionProgress[]
dropMissionCompletions DropMissionCompletion[]
```

### Reward storage later

Rewards can evolve independently from mission definitions. A later version can add dedicated tables such as:

- `UserWallet` or `UserBalance` for `SUPER_TOKENS`
- `Badge` and `UserBadge`
- `LotteryEntry`
- or a generic `UserRewardLedger`

In an early version, the reward definition can stay in `rewardPayload` and be processed by a dedicated reward service.

---

## JSON `definition` shape

The mission definition should separate three concerns:

- **when** the mission is active
- **how** the mission progresses
- **what** must be true for the request to count

This keeps the structure flexible without relying on brittle string parsing.

```typescript
// Conceptual TypeScript shape. Validate this with Zod in the real implementation.

type DropDefinition = {
  version: 1;

  /** When the mission can progress or complete */
  schedule:
    | { kind: "always" }
    | { kind: "calendar_date"; dates: string[] } // "YYYY-MM-DD"
    | { kind: "time_of_day"; start: "HH:mm"; end: "HH:mm" }
    | { kind: "weekday"; days: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[] }
    | { kind: "cron"; expression: string }
    | { kind: "compound"; all?: DropDefinition["schedule"][]; any?: DropDefinition["schedule"][] };

  /**
   * How each successful API action affects mission state
   * - instant: one request can complete the mission
   * - aggregate_count: keep counting until the threshold is reached
   * - rolling_window: evaluate events grouped inside a time window
   * - sequence: ordered steps that must happen within a maximum duration
   */
  progressMode:
    | { kind: "instant" }
    | { kind: "aggregate_count"; source: "transaction_created" | "api_call"; threshold: number }
    | { kind: "rolling_window"; windowMinutes: number; rules: Rule }
    | {
        kind: "sequence";
        maxTotalMinutes: number;
        steps: Array<{ rule: Rule }>;
      };

  /** Condition evaluated against the current request and its context */
  rule: Rule;
};

type Rule =
  | { kind: "any"; of: Rule[] }
  | { kind: "all"; of: Rule[] }
  | { kind: "payload_jsonpath"; path: string; op: "eq" | "in" | "regex" | "gte"; value: unknown }
  | { kind: "amount"; equals?: number; gte?: number; lte?: number }
  | { kind: "bank_account_name"; op: "eq" | "in" | "regex"; values: string[]; caseSensitive?: boolean }
  | { kind: "first_global"; entity: "transaction" }
  | { kind: "body_contains"; field: string; substring: string }
  | { kind: "string_length"; field: string; op: "gt"; length: number };
```

### Why this is better than parsing `"transaction:count:gte"`

A raw shape like this:

```json
{
  "endpoint": "/transaction/create",
  "type": "transaction:count:gte",
  "condition": { "count": "100", "time": "14:00 - 16:00" }
}
```

is useful as a first thought, but it becomes fragile once the system grows.

For example, `type: "transaction:count:gte"` actually mixes together:

- the event category
- the progress behavior
- the comparison operator

That is why a better mapping is:

- `progressMode.kind === "aggregate_count"`
- `threshold: 100`
- optional `rule` entries for payload or time constraints

Instead of splitting strings with `split(":")`, the implementation can use a small registry of evaluator functions, for example:

```ts
evaluators[progressMode.kind](ctx);
```

That is easier to test, easier to extend, and much easier to read.

---

## Mapping your mission examples to this structure

| #   | Mission                     | Typical trigger                  | Schedule                         | Progress mode                      | Rule notes                                       |
| --- | --------------------------- | -------------------------------- | -------------------------------- | ---------------------------------- | ------------------------------------------------ |
| 1   | 100 transactions            | `/api/v1/transactions/create`    | `always`                         | `aggregate_count`, threshold `100` | No extra payload condition needed                |
| 2   | First transaction globally  | `/api/v1/transactions/create`    | `always`                         | `instant`                          | Requires race-safe global uniqueness logic       |
| 3   | Vault name “Emergency Fund” | `/api/v1/bank-account/create`    | `always`                         | `instant`                          | Exact name match                                 |
| 4   | Happy Hour 222 CZT          | `/api/v1/transactions/create`    | Daily `14:00–14:30`              | `instant`                          | `amount.equals = 222`                            |
| 5   | Green Pledge                | Donation endpoint, still TBD     | April 22                         | `instant`                          | Needs campaign/tag support first                 |
| 6   | Mystery vault name          | `/api/v1/bank-account/create`    | `always`, but secret             | `instant`                          | Allowed names list or regex                      |
| 7   | Squad Goal                  | `/api/v1/transactions/create`    | Saturdays                        | `rolling_window`, `120` minutes    | Amount at least `50`, sent to `3` distinct users |
| 8   | Bug Bounty Lite             | `/api/v1/bugs/report`, still TBD | Depends on release state         | `instant`                          | Keyword in request body                          |
| 9   | Midnight Madness            | Any valid `/api/v1/*` call       | `00:00–01:00`                    | `instant`                          | Valid authenticated request is enough            |
| 10  | Kind Words Campaign         | `/api/v1/transactions/create`    | `always`                         | `instant`                          | Needs `message` field first                      |
| 11  | Christmas Vault Drop        | `/api/v1/bank-account/create`    | December 24                      | `instant`                          | Name in approved list                            |
| 12  | Wizard-Level API Flow       | Multiple endpoints               | Weekly reset + 5-minute sequence | `sequence`                         | Multi-step mission                               |

### Note on multi-step missions

The “Wizard-Level API Flow” mission is different because it spans multiple actions and possibly multiple routes.

There are two reasonable ways to model that:

- store multiple mission rows that share a common `slug` or group id
- store one mission row with broader matching and let the evaluator inspect a richer route context

Either option can work. The second is more flexible, while the first can be easier to reason about early on.

---

## Recommended placement for mission evaluation

Mission logic should not live in Next.js middleware.

Middleware is not a good fit because it does not naturally own:

- the parsed request body
- the authenticated business context
- the final success or failure of the operation

The recommended pattern is:

1. A route handler completes its main business action successfully.
2. The route then calls something like `evaluateDropsAfterSuccess(ctx)`.
3. That function loads active missions for the route, checks schedule and rules, updates progress or completion, and triggers rewards.

The context passed into this function would typically contain:

- `userId`
- `method`
- `path`
- parsed request body
- relevant result data such as created ids
- `occurredAt`

An optional refinement is a wrapper such as `withDropEvaluation(handler)` for POST routes, so the evaluation step is consistently applied.

This keeps middleware light and keeps mission logic close to the successful API action that actually matters.

---

## Example mission JSON

### Mission: 100 transactions

```json
{
  "version": 1,
  "schedule": { "kind": "always" },
  "progressMode": {
    "kind": "aggregate_count",
    "source": "transaction_created",
    "threshold": 100
  },
  "rule": { "kind": "all", "of": [] }
}
```

Use with:

- `triggerMethod = POST`
- `triggerPath = /api/v1/transactions/create`

### Mission: create vault named “Emergency Fund”

```json
{
  "version": 1,
  "schedule": { "kind": "always" },
  "progressMode": { "kind": "instant" },
  "rule": {
    "kind": "bank_account_name",
    "op": "eq",
    "values": ["Emergency Fund"],
    "caseSensitive": true
  }
}
```

Use with:

- `triggerMethod = POST`
- `triggerPath = /api/v1/bank-account/create`

### Mission: Happy Hour Transfer

```json
{
  "version": 1,
  "schedule": { "kind": "time_of_day", "start": "14:00", "end": "14:30" },
  "progressMode": { "kind": "instant" },
  "rule": { "kind": "amount", "equals": 222 }
}
```

Use with:

- `triggerMethod = POST`
- `triggerPath = /api/v1/transactions/create`

---

## Suggested implementation order

To keep the first version realistic, the implementation can be built in small steps.

1. Add Prisma models and migration for mission definitions, progress, and completions.
2. Seed a few simple missions first:
   - 100 transactions
   - Emergency Fund vault
   - Happy Hour 222 CZT
3. Implement `evaluateDropsAfterSuccess`.
4. Wire evaluation only into:
   - `transactions/create`
   - `bank-account/create`
5. Add read endpoints such as:
   - `GET /api/v1/drops`
   - `GET /api/v1/drops/me`
6. Add richer mission support later for:
   - transaction messages
   - labels
   - donations
   - bug reports
   - lottery and badge reward services

## Final recommendation

The best base structure for Czechibank is:

- mission definitions stored in PostgreSQL through Prisma
- flexible mission rules stored as versioned JSON
- per-user progress and completions stored separately
- mission evaluation triggered after successful API actions
- a UI that uses the same API path as Postman and external API consumers

This gives you one consistent mission engine for education, gamification, and API practice, without overloading middleware or coupling the rules too tightly to the frontend.
