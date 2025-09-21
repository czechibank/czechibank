"use server";

import { FeatureType } from "@/domain/features-domain/features.schema";
import prisma from "@/lib/db";

/**
 * Custom features repository functions
 */

export async function getAllFeatures(): Promise<FeatureType[]> {
  return await prisma.feature.findMany();
}

export async function updateFeatures(features: FeatureType[]): Promise<void> {
  for (const feature of features) {
    await prisma.feature.update({
      where: { id: feature.id },
      data: { toggle: feature.toggle },
    });
  }
}
