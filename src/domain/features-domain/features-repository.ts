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
  // DIRTY HACK: update all features with "true" value
  await prisma.feature.updateMany({
    data: {
      toggle: true,
    },
    where: {
      id: {
        in: features.filter((feat: FeatureType) => feat.toggle).map((feat: FeatureType) => feat.id),
      },
    },
  });

  // DIRTY HACK: update all features with "false" value
  await prisma.feature.updateMany({
    data: {
      toggle: false,
    },
    where: {
      id: {
        in: features.filter((feat: FeatureType) => !feat.toggle).map((feat: FeatureType) => feat.id),
      },
    },
  });
}
