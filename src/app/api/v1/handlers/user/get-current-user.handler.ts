import { authenticateRequest } from "@/app/api/v1/auth";

/**
 * Returns the authenticated user. The response shape is unchanged from the
 * previous inline route (the user object becomes `data`).
 */
export function handleGetCurrentUser(request: Request) {
  return authenticateRequest(request);
}
