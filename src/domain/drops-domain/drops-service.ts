import type { DropMission, DropMissionProgress } from "@/domain/drops-domain/drops-types";
import { badRequest, fromUnknown, notFound, validationError, type AppError } from "@/lib/errors";
import type { Prisma } from "@prisma/client";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import * as repository from "./drops-repository";
import { evaluateRule, type EvalContext } from "./drops-rules";
import { isScheduleActive } from "./drops-schedule";
import { CreateDropMissionSchema, DropDefinitionSchema, UpdateDropMissionSchema } from "./drops-schema";

export type DropCompletionNotice = {
  slug: string;
  name: string;
  rewardType: string;
  rewardAmount?: number;
};

export type GamificationCompletion = {
  slug: string;
  name: string;
  rewardType: string;
  completedAt: string;
  rewardPayload: Prisma.JsonValue | null;
};

export type EvaluateDropsContext = {
  userId: string;
  method: string;
  path: string;
  requestBody: Record<string, unknown>;
  resultData: Record<string, unknown>;
  occurredAt?: Date;
};

async function evaluateSingleMission(
  mission: DropMission,
  userId: string,
  evalCtx: EvalContext,
  now: Date,
): Promise<DropCompletionNotice | null> {
  const parsedDef = DropDefinitionSchema.safeParse(mission.definition);
  if (!parsedDef.success) {
    console.warn("[drops] Invalid mission definition", mission.slug, parsedDef.error.flatten());
    return null;
  }
  const definition = parsedDef.data;

  if (!isScheduleActive(definition.schedule as Parameters<typeof isScheduleActive>[0], now, mission.timezone)) {
    return null;
  }

  // Plan order: skip if already completed before evaluating rules (saves work; tx still guards races).
  const existingCompletion = await repository.findCompletionByMissionAndUser(mission.id, userId);
  if (existingCompletion) {
    return null;
  }

  if (!evaluateRule(definition.rule, evalCtx)) {
    return null;
  }

  const { progressMode } = definition;

  if (progressMode.kind === "instant") {
    const res = await repository.completeInstantMission(mission, userId);
    if (!res.completed) return null;
    return {
      slug: mission.slug,
      name: mission.name,
      rewardType: mission.rewardType,
      ...(res.rewardAmount !== undefined ? { rewardAmount: res.rewardAmount } : {}),
    };
  }

  if (progressMode.kind === "aggregate_count") {
    const res = await repository.progressAggregateAndMaybeComplete(mission, userId, progressMode.threshold);
    if (!res.completed) return null;
    return {
      slug: mission.slug,
      name: mission.name,
      rewardType: mission.rewardType,
      ...(res.rewardAmount !== undefined ? { rewardAmount: res.rewardAmount } : {}),
    };
  }

  return null;
}

const dropsService = {
  async evaluateDropsAfterSuccess(ctx: EvaluateDropsContext): Promise<{ completedMissions: DropCompletionNotice[] }> {
    try {
      const now = ctx.occurredAt ?? new Date();
      const missions = await repository.findActiveMissionsByTrigger(ctx.method, ctx.path, now);
      const evalCtx: EvalContext = {
        requestBody: ctx.requestBody,
        resultData: ctx.resultData,
      };

      const completedMissions: DropCompletionNotice[] = [];
      for (const mission of missions) {
        try {
          const notice = await evaluateSingleMission(mission, ctx.userId, evalCtx, now);
          if (notice) completedMissions.push(notice);
        } catch (e) {
          console.error("[drops] Mission evaluation failed", mission.slug, e);
        }
      }
      return { completedMissions };
    } catch (e) {
      console.error("[drops] evaluateDropsAfterSuccess failed", e);
      return { completedMissions: [] };
    }
  },

  createMissionResult(raw: unknown): ResultAsync<DropMission, AppError> {
    const parsed = CreateDropMissionSchema.safeParse(raw);
    if (!parsed.success) {
      return errAsync(
        validationError(
          "Invalid mission payload",
          parsed.error.errors.map((e) => ({
            code: "VALIDATION_ERROR",
            field: e.path.join("."),
            message: e.message,
          })),
        ),
      );
    }
    const d = parsed.data;
    return ResultAsync.fromPromise(
      repository.createMission({
        slug: d.slug,
        name: d.name,
        description: d.description,
        visibility: d.visibility,
        triggerMethod: d.triggerMethod,
        triggerPath: d.triggerPath,
        timezone: d.timezone,
        definition: d.definition as unknown as Prisma.InputJsonValue,
        rewardType: d.rewardType,
        rewardPayload: d.rewardPayload === undefined ? undefined : (d.rewardPayload as Prisma.InputJsonValue),
        active: d.active,
        startsAt: d.startsAt ? new Date(d.startsAt) : undefined,
        endsAt: d.endsAt ? new Date(d.endsAt) : undefined,
      }),
      (e) => fromUnknown(e, "Failed to create mission"),
    );
  },

  updateMissionBySlugResult(slug: string, raw: unknown): ResultAsync<DropMission, AppError> {
    const parsed = UpdateDropMissionSchema.safeParse(raw);
    if (!parsed.success) {
      return errAsync(
        validationError(
          "Invalid mission payload",
          parsed.error.errors.map((e) => ({
            code: "VALIDATION_ERROR",
            field: e.path.join("."),
            message: e.message,
          })),
        ),
      );
    }
    const d = parsed.data;
    const data: Prisma.DropMissionUpdateInput = {};
    if (d.slug !== undefined) data.slug = d.slug;
    if (d.name !== undefined) data.name = d.name;
    if (d.description !== undefined) data.description = d.description;
    if (d.visibility !== undefined) data.visibility = d.visibility;
    if (d.triggerMethod !== undefined) data.triggerMethod = d.triggerMethod;
    if (d.triggerPath !== undefined) data.triggerPath = d.triggerPath;
    if (d.timezone !== undefined) data.timezone = d.timezone;
    if (d.definition !== undefined) data.definition = d.definition as unknown as Prisma.InputJsonValue;
    if (d.rewardType !== undefined) data.rewardType = d.rewardType;
    if (d.rewardPayload !== undefined) data.rewardPayload = d.rewardPayload as Prisma.InputJsonValue;
    if (d.active !== undefined) data.active = d.active;
    if (d.startsAt !== undefined) data.startsAt = d.startsAt ? new Date(d.startsAt) : null;
    if (d.endsAt !== undefined) data.endsAt = d.endsAt ? new Date(d.endsAt) : null;

    if (Object.keys(data).length === 0) {
      return errAsync(badRequest("No fields to update"));
    }

    return ResultAsync.fromPromise(repository.updateMissionBySlug(slug, data), () => notFound("Mission not found"));
  },

  deleteMissionBySlugResult(slug: string): ResultAsync<{ deleted: true }, AppError> {
    return ResultAsync.fromPromise(repository.deleteMissionBySlug(slug), () => notFound("Mission not found")).map(
      () => ({ deleted: true as const }),
    );
  },

  getMissionBySlugResult(slug: string): ResultAsync<DropMission, AppError> {
    return ResultAsync.fromSafePromise(repository.findMissionBySlug(slug)).andThen((mission) =>
      mission ? okAsync(mission) : errAsync(notFound("Mission not found")),
    );
  },

  getMyDropStatus(userId: string): ResultAsync<
    {
      dropMissions: Array<{
        mission: DropMission;
        progress: DropMissionProgress | null;
        completed: boolean;
        completedAt: string | null;
      }>;
    },
    AppError
  > {
    return ResultAsync.fromSafePromise(
      Promise.all([
        repository.findPublishedMissions(),
        repository.findAllProgressByUser(userId),
        repository.findAllCompletionsByUser(userId),
      ]),
    ).map(([missions, progressList, completionList]) => {
      const progressByMission = new Map(progressList.map((p) => [p.missionId, p]));
      const completionByMission = new Map(completionList.map((c) => [c.missionId, c]));

      const rows = missions.map((mission) => {
        const progress = progressByMission.get(mission.id) ?? null;
        const completion = completionByMission.get(mission.id);
        return {
          mission,
          progress,
          completed: Boolean(completion),
          completedAt: completion?.completedAt.toISOString() ?? null,
        };
      });

      return { dropMissions: rows };
    });
  },

  getAllMissionsResult(filters: repository.ListMissionsFilters) {
    return ResultAsync.fromSafePromise(repository.findAllMissions(filters));
  },

  /** Completed missions for this user (includes `mission` relation). Plan parity wrapper around the repository. */
  async getMyCompletions(userId: string) {
    return repository.findCompletionsByUser(userId);
  },

  /** Super tokens balance + completed missions (for profile / header UI). */
  async getGamificationSummary(userId: string): Promise<{
    superTokens: number;
    displayTitle: string | null;
    completed: GamificationCompletion[];
  }> {
    const [profile, raw] = await Promise.all([
      repository.getUserGamificationProfile(userId),
      repository.findCompletionsByUser(userId),
    ]);
    const { superTokens, displayTitle } = profile;

    const completed: GamificationCompletion[] = [];
    for (const row of raw as Array<{
      completedAt: Date;
      mission: { slug: string; name: string; rewardType: string; rewardPayload: Prisma.JsonValue | null };
    }>) {
      if (!row?.mission) continue;
      completed.push({
        slug: row.mission.slug,
        name: row.mission.name,
        rewardType: row.mission.rewardType,
        completedAt: row.completedAt.toISOString(),
        rewardPayload: row.mission.rewardPayload,
      });
    }

    return { superTokens, displayTitle, completed };
  },
};

export default dropsService;
