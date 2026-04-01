"use server";

import { FeatureType } from "@/domain/features-domain/features.schema";
import prisma from "@/lib/db";

/**
 * Custom features repository functions
 */

export type PaginatedFeatures = {
  items: FeatureType[];
  total: number;
  page: number;
  limit: number;
};

export async function getAllFeatures({
  page = 1,
  limit = 10,
}: { page?: number; limit?: number } = {}): Promise<PaginatedFeatures> {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([prisma.feature.findMany({ skip, take: limit }), prisma.feature.count()]);

  return { items, total, page, limit };
}

export async function updateFeatures(features: FeatureType[]): Promise<void> {
  for (const feature of features) {
    await prisma.feature.update({
      where: { id: feature.id },
      data: { toggle: feature.toggle },
    });
  }
}
