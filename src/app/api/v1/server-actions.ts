"use server";

import userService from "@/domain/user-domain/user-service";
import { ApiErrorCode, errorResponse, type ErrorResponse } from "@/lib/response";
import { User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function checkUserAuthOrThrowError(request: Request): Promise<User | ErrorResponse> {
  const headersList = request.headers;
  const apiKey = headersList.get("X-API-Key");

  if (!apiKey) {
    return errorResponse("Unauthorized", ApiErrorCode.UNAUTHORIZED);
  }

  const user = await userService.getUserByBearerToken(apiKey);

  if ("error" in user) {
    return errorResponse("Unauthorized", ApiErrorCode.UNAUTHORIZED);
  }

  return user.data;
}

export async function generateRequestId(): Promise<string> {
  return Promise.resolve(uuidv4());
}
