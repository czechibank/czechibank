import { FeatureType } from "@/domain/features-domain/features.schema";
import { ApiErrorCode, ErrorResponse, errorResponse, SuccessResponse, successResponse } from "@/lib/response";
import * as featuresRepository from "./features-repository";

const featuresService = {
  server: {
    async getAllFeatures(): Promise<SuccessResponse<FeatureType[]> | ErrorResponse> {
      try {
        const features: FeatureType[] = await featuresRepository.getAllFeatures();
        return successResponse("Features fetched successfully", features);
      } catch (error) {
        throw errorResponse("Features fetched error", ApiErrorCode.OPERATION_FAILED);
      }
    },

    async updateFeatures(features: FeatureType[]): Promise<SuccessResponse<FeatureType[]> | ErrorResponse> {
      try {
        await featuresRepository.updateFeatures(features);
        return successResponse("Features updated successfully", features);
      } catch (error) {
        return errorResponse("Failed to update features", ApiErrorCode.OPERATION_FAILED);
      }
    },
  },
};

export default featuresService;
