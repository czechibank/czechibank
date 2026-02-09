import { FeaturesKeys, FeatureType } from "@/domain/features-domain/features.schema";
import { operationFailed } from "@/lib/errors";
import { type ErrorResponse, type SuccessResponse } from "@/lib/response";
import { toServiceResponse } from "@/lib/result-helpers";
import { ResultAsync } from "neverthrow";
import * as featuresRepository from "./features-repository";

const featuresService = {
  server: {
    getAllFeaturesResult(): ResultAsync<FeatureType[], import("@/lib/errors").AppError> {
      return ResultAsync.fromPromise(featuresRepository.getAllFeatures(), () =>
        operationFailed("Features fetched error"),
      );
    },

    updateFeaturesResult(features: FeatureType[]): ResultAsync<FeatureType[], import("@/lib/errors").AppError> {
      return ResultAsync.fromPromise(
        featuresRepository.updateFeatures(features).then(() => features),
        () => operationFailed("Failed to update features"),
      );
    },

    async getAllFeatures(): Promise<SuccessResponse<FeatureType[]> | ErrorResponse> {
      return toServiceResponse(this.getAllFeaturesResult(), "Features fetched successfully");
    },

    async updateFeatures(features: FeatureType[]): Promise<SuccessResponse<FeatureType[]> | ErrorResponse> {
      return toServiceResponse(this.updateFeaturesResult(features), "Features updated successfully");
    },
  },
  client: {
    getFeatureToggle(featureKey: FeaturesKeys, allFeatures: FeatureType[]): boolean {
      if (allFeatures?.length === 0) {
        console.warn("No features available to check the toggle.");
        return false;
      }

      const feature = allFeatures.find((f) => f.key === featureKey);
      if (!feature) {
        console.warn(`Feature with key "${featureKey}" not found.`);
        return false;
      }
      return feature.toggle;
    },
  },
};

export default featuresService;
