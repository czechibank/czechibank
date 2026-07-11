import { z } from "zod";

const DropVisibilitySchema = z.enum(["PUBLISHED", "SECRET"]);

/**
 * Reward types that `grantMissionRewardsTx` actually implements. The Prisma
 * enum also contains BADGE, VAULT_BONUS and LOTTERY_ENTRY for forward
 * compatibility, but missions must not be created with them until granting is
 * implemented — otherwise a completed mission silently grants nothing.
 */
const ImplementedRewardTypeSchema = z.enum(["SUPER_TOKENS", "DISPLAY_TITLE"]);

const MAX_REGEX_PATTERN_LENGTH = 200;

const ScheduleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("always") }),
  z.object({ kind: z.literal("calendar_date"), dates: z.array(z.string()) }),
  z.object({ kind: z.literal("time_of_day"), start: z.string(), end: z.string() }),
  z.object({
    kind: z.literal("weekday"),
    days: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])),
  }),
]);

export const ruleSchema: z.ZodType<unknown> = z.lazy(() =>
  z
    .discriminatedUnion("kind", [
      z.object({ kind: z.literal("all"), of: z.array(ruleSchema) }),
      z.object({ kind: z.literal("any"), of: z.array(ruleSchema) }),
      z.object({
        kind: z.literal("amount"),
        equals: z.number().optional(),
        gte: z.number().optional(),
      }),
      z.object({
        kind: z.literal("bank_account_name"),
        op: z.enum(["eq", "in", "regex"]),
        values: z.array(z.string()),
        caseSensitive: z.boolean().optional(),
      }),
    ])
    .superRefine((rule, ctx) => {
      // A bare amount rule would match ANY request that carries an amount.
      if (rule.kind === "amount" && rule.equals === undefined && rule.gte === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "amount rule requires at least one comparator (equals or gte)",
        });
      }
      // Catch invalid/oversized regex patterns at creation time instead of
      // silently failing (or compiling something pathological) on every
      // evaluated request.
      if (rule.kind === "bank_account_name" && rule.op === "regex") {
        rule.values.forEach((pattern, index) => {
          if (pattern.length > MAX_REGEX_PATTERN_LENGTH) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["values", index],
              message: `regex pattern too long (max ${MAX_REGEX_PATTERN_LENGTH} characters)`,
            });
            return;
          }
          try {
            new RegExp(pattern);
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["values", index],
              message: "invalid regex pattern",
            });
          }
        });
      }
    }),
);

const ProgressModeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("instant") }),
  z.object({
    kind: z.literal("aggregate_count"),
    source: z.enum(["transaction_created", "bank_account_created", "api_call"]),
    threshold: z.number().int().positive(),
  }),
]);

export const DropDefinitionSchema = z.object({
  version: z.literal(1),
  schedule: ScheduleSchema,
  progressMode: ProgressModeSchema,
  rule: ruleSchema,
});

/**
 * Ensures the reward payload matches what granting actually reads
 * (see `grantSuperTokensTx` / `grantDisplayTitleTx`), so a mission can't be
 * created whose completion silently grants nothing.
 */
function validateRewardPayload(
  data: { rewardType?: string; rewardPayload?: Record<string, unknown> },
  ctx: z.RefinementCtx,
) {
  if (data.rewardType === "SUPER_TOKENS") {
    const raw = data.rewardPayload?.amount;
    const amount = typeof raw === "string" ? Number(raw) : raw;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rewardPayload", "amount"],
        message: "SUPER_TOKENS reward requires rewardPayload.amount to be a positive number",
      });
    }
  }
  if (data.rewardType === "DISPLAY_TITLE") {
    const payload = data.rewardPayload ?? {};
    const raw = payload.text ?? payload.title ?? payload.displayTitle;
    if (typeof raw !== "string" || raw.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rewardPayload"],
        message: "DISPLAY_TITLE reward requires rewardPayload.text (non-empty string)",
      });
    }
  }
}

const DropMissionFieldsSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  visibility: DropVisibilitySchema.default("PUBLISHED"),
  triggerMethod: z.enum(["POST", "GET", "PUT", "DELETE"]).default("POST"),
  triggerPath: z.string().min(1),
  timezone: z.string().default("Europe/Prague"),
  definition: DropDefinitionSchema,
  rewardType: ImplementedRewardTypeSchema,
  rewardPayload: z.record(z.unknown()).optional(),
  active: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const CreateDropMissionSchema = DropMissionFieldsSchema.superRefine(validateRewardPayload);

// On update the payload is only checked when rewardType is part of the patch:
// changing the reward type requires sending a payload that matches it.
export const UpdateDropMissionSchema = DropMissionFieldsSchema.partial().superRefine((data, ctx) => {
  if (data.rewardType !== undefined) {
    validateRewardPayload(data, ctx);
  }
});

export type DropDefinitionInput = z.infer<typeof DropDefinitionSchema>;
export type CreateDropMissionInput = z.infer<typeof CreateDropMissionSchema>;
export type UpdateDropMissionInput = z.infer<typeof UpdateDropMissionSchema>;
