"use server";

import type { DropVisibility } from "@/domain/drops-domain/drops-types";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function getUserSuperTokens(userId: string): Promise<number> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { superTokens: true },
  });
  return row?.superTokens ?? 0;
}

export async function getUserGamificationProfile(
  userId: string,
): Promise<{ superTokens: number; displayTitle: string | null }> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { superTokens: true, displayTitle: true },
  });
  return {
    superTokens: row?.superTokens ?? 0,
    displayTitle: row?.displayTitle ?? null,
  };
}

export async function findActiveMissionsByTrigger(method: string, path: string, now: Date = new Date()) {
  return prisma.dropMission.findMany({
    where: {
      active: true,
      triggerMethod: method,
      triggerPath: path,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
  });
}

export async function findMissionBySlug(slug: string) {
  return prisma.dropMission.findUnique({ where: { slug } });
}

export async function findMissionById(id: string) {
  return prisma.dropMission.findUnique({ where: { id } });
}

export type ListMissionsFilters = {
  page?: number;
  limit?: number;
  visibility?: DropVisibility;
};

export async function findAllMissions({ page = 1, limit = 50, visibility }: ListMissionsFilters) {
  const skip = (page - 1) * limit;
  const where: Prisma.DropMissionWhereInput = visibility ? { visibility } : {};
  const [items, total] = await Promise.all([
    prisma.dropMission.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.dropMission.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function findPublishedMissions() {
  return prisma.dropMission.findMany({
    where: { visibility: "PUBLISHED", active: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMission(data: Prisma.DropMissionCreateInput) {
  return prisma.dropMission.create({ data });
}

export async function updateMissionBySlug(slug: string, data: Prisma.DropMissionUpdateInput) {
  return prisma.dropMission.update({ where: { slug }, data });
}

export async function deleteMissionBySlug(slug: string) {
  return prisma.dropMission.delete({ where: { slug } });
}

export async function findProgressByMissionAndUser(missionId: string, userId: string) {
  return prisma.dropMissionProgress.findUnique({
    where: { missionId_userId: { missionId, userId } },
  });
}

export async function findAllProgressByUser(userId: string) {
  return prisma.dropMissionProgress.findMany({ where: { userId } });
}

export async function findAllCompletionsByUser(userId: string) {
  return prisma.dropMissionCompletion.findMany({ where: { userId } });
}

export async function upsertProgress(missionId: string, userId: string, state: Prisma.InputJsonValue) {
  return prisma.dropMissionProgress.upsert({
    where: { missionId_userId: { missionId, userId } },
    create: { missionId, userId, state },
    update: { state },
  });
}

export async function findCompletionByMissionAndUser(missionId: string, userId: string) {
  return prisma.dropMissionCompletion.findUnique({
    where: { missionId_userId: { missionId, userId } },
  });
}

export async function createCompletion(missionId: string, userId: string, metadata?: Prisma.InputJsonValue) {
  return prisma.dropMissionCompletion.create({
    data: { missionId, userId, metadata },
  });
}

export async function findCompletionsByUser(userId: string) {
  return prisma.dropMissionCompletion.findMany({
    where: { userId },
    include: { mission: true },
    orderBy: { completedAt: "desc" },
  });
}

function superTokenAmountFromPayload(rewardPayload: Prisma.JsonValue | null): number {
  if (!rewardPayload || typeof rewardPayload !== "object" || Array.isArray(rewardPayload)) return 0;
  const raw = (rewardPayload as Record<string, unknown>).amount;
  const amt = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : 0;
  return Number.isFinite(amt) && amt > 0 ? Math.floor(amt) : 0;
}

async function grantSuperTokensTx(
  tx: Prisma.TransactionClient,
  userId: string,
  rewardPayload: Prisma.JsonValue | null,
) {
  const amt = superTokenAmountFromPayload(rewardPayload);
  if (amt <= 0) return undefined;
  await tx.user.update({
    where: { id: userId },
    data: { superTokens: { increment: amt } },
  });
  return amt;
}

function displayTitleFromPayload(rewardPayload: Prisma.JsonValue | null): string | null {
  if (!rewardPayload || typeof rewardPayload !== "object" || Array.isArray(rewardPayload)) return null;
  const o = rewardPayload as Record<string, unknown>;
  const raw = o.text ?? o.title ?? o.displayTitle;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  return t.slice(0, 120);
}

async function grantDisplayTitleTx(
  tx: Prisma.TransactionClient,
  userId: string,
  rewardPayload: Prisma.JsonValue | null,
) {
  const text = displayTitleFromPayload(rewardPayload);
  if (!text) return;
  await tx.user.update({
    where: { id: userId },
    data: { displayTitle: text },
  });
}

async function grantMissionRewardsTx(
  tx: Prisma.TransactionClient,
  userId: string,
  mission: { rewardType: string; rewardPayload: Prisma.JsonValue | null },
): Promise<number | undefined> {
  let rewardAmount: number | undefined;
  if (mission.rewardType === "SUPER_TOKENS") {
    rewardAmount = await grantSuperTokensTx(tx, userId, mission.rewardPayload);
  } else if (mission.rewardType === "DISPLAY_TITLE") {
    await grantDisplayTitleTx(tx, userId, mission.rewardPayload);
  }
  return rewardAmount;
}

/** Increment aggregate counter inside a transaction; complete and grant when threshold reached. */
export async function progressAggregateAndMaybeComplete(
  mission: { id: string; rewardType: string; rewardPayload: Prisma.JsonValue | null },
  userId: string,
  threshold: number,
): Promise<{ completed: boolean; alreadyDone: boolean; progressCount?: number; rewardAmount?: number }> {
  const missionId = mission.id;
  return prisma.$transaction(async (tx) => {
    const existing = await tx.dropMissionCompletion.findUnique({
      where: { missionId_userId: { missionId, userId } },
    });
    if (existing) {
      return { completed: false, alreadyDone: true };
    }

    const prog = await tx.dropMissionProgress.findUnique({
      where: { missionId_userId: { missionId, userId } },
    });
    const prev =
      prog?.state && typeof prog.state === "object" && prog.state !== null && "count" in prog.state
        ? Number((prog.state as Record<string, unknown>).count)
        : 0;
    const count = (Number.isFinite(prev) ? prev : 0) + 1;

    await tx.dropMissionProgress.upsert({
      where: { missionId_userId: { missionId, userId } },
      create: { missionId, userId, state: { count } as Prisma.InputJsonValue },
      update: { state: { count } as Prisma.InputJsonValue },
    });

    if (count < threshold) {
      return { completed: false, alreadyDone: false, progressCount: count };
    }

    await tx.dropMissionCompletion.create({
      data: { missionId, userId },
    });

    const rewardAmount = await grantMissionRewardsTx(tx, userId, mission);

    return { completed: true, alreadyDone: false, progressCount: count, rewardAmount };
  });
}

/** Create completion and grant reward if not already completed. */
export async function completeInstantMission(
  mission: { id: string; rewardType: string; rewardPayload: Prisma.JsonValue | null },
  userId: string,
): Promise<{ completed: boolean; alreadyDone: boolean; rewardAmount?: number }> {
  const missionId = mission.id;
  return prisma.$transaction(async (tx) => {
    const existing = await tx.dropMissionCompletion.findUnique({
      where: { missionId_userId: { missionId, userId } },
    });
    if (existing) {
      return { completed: false, alreadyDone: true };
    }

    await tx.dropMissionCompletion.create({
      data: { missionId, userId },
    });

    const rewardAmount = await grantMissionRewardsTx(tx, userId, mission);

    return { completed: true, alreadyDone: false, rewardAmount };
  });
}
