import { FeaturesKeys, FeatureType } from "@/domain/features-domain/features.schema";
import { operationFailed, validationError } from "@/lib/errors";
import { type ErrorResponse, type SuccessResponse } from "@/lib/response";
import { toServiceResponse } from "@/lib/result-helpers";
import { errAsync, ResultAsync } from "neverthrow";
import * as featuresRepository from "./features-repository";

const featuresService = {
  server: {
    getAllFeaturesResult(
      pagination: { page: number; limit: number } = { page: 1, limit: 10 },
    ): ResultAsync<featuresRepository.PaginatedFeatures, import("@/lib/errors").AppError> {
      if (
        isNaN(pagination.page) ||
        isNaN(pagination.limit) ||
        pagination.page < 1 ||
        pagination.limit < 1 ||
        pagination.limit > 100
      ) {
        return errAsync(
          validationError("Invalid pagination parameters", [
            ...(isNaN(pagination.page) || pagination.page < 1
              ? [{ code: "VALIDATION_ERROR", field: "page", message: "Page must be a positive integer" }]
              : []),
            ...(isNaN(pagination.limit) || pagination.limit < 1 || pagination.limit > 100
              ? [{ code: "VALIDATION_ERROR", field: "limit", message: "Limit must be between 1 and 100" }]
              : []),
          ]),
        );
      }
      return ResultAsync.fromPromise(featuresRepository.getAllFeatures(pagination), () =>
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
      return toServiceResponse(
        this.getAllFeaturesResult().map((r) => r.items),
        "Features fetched successfully",
      );
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
