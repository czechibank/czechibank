import { z } from "zod";

const DropVisibilitySchema = z.enum(["PUBLISHED", "SECRET"]);
const DropRewardTypeSchema = z.enum(["SUPER_TOKENS", "BADGE", "VAULT_BONUS", "LOTTERY_ENTRY", "DISPLAY_TITLE"]);

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
  z.discriminatedUnion("kind", [
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
  ]),
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

export const CreateDropMissionSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  visibility: DropVisibilitySchema.default("PUBLISHED"),
  triggerMethod: z.enum(["POST", "GET", "PUT", "DELETE"]).default("POST"),
  triggerPath: z.string().min(1),
  timezone: z.string().default("Europe/Prague"),
  definition: DropDefinitionSchema,
  rewardType: DropRewardTypeSchema,
  rewardPayload: z.record(z.unknown()).optional(),
  active: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export const UpdateDropMissionSchema = CreateDropMissionSchema.partial();

export type DropDefinitionInput = z.infer<typeof DropDefinitionSchema>;
export type CreateDropMissionInput = z.infer<typeof CreateDropMissionSchema>;
export type UpdateDropMissionInput = z.infer<typeof UpdateDropMissionSchema>;
