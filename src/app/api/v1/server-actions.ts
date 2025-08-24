"use server";

import userService from "@/domain/user-domain/user-service";
import { ApiErrorCode, errorResponse, type ErrorResponse } from "@/lib/response";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../../../../auth";

export async function checkUserAuthOrThrowError(
  request: Request,
): Promise<typeof auth.$Infer.Session.user | ErrorResponse> {
  const headersList = request.headers;
  const apiKey = headersList.get("X-API-Key");

  if (!apiKey) {
    return errorResponse("Unauthorized", ApiErrorCode.UNAUTHORIZED);
  }

  const session = await userService.server.getSession(
    new Headers({
      "x-api-key": apiKey,
    }),
  );

  if (!session) {
    return errorResponse("Unauthorized", ApiErrorCode.UNAUTHORIZED);
  }

  return session.user;
}

export async function generateRequestId(): Promise<string> {
  return Promise.resolve(uuidv4());
}
