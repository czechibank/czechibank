import type { ErrorContext } from "better-auth/react";

/**
 * Builds the message shown when sign-out fails.
 *
 * The message always states that the user is still signed in. The server only clears the
 * session when the request reaches the handler, so a failed sign-out leaves the session
 * cookie valid - telling the user anything else would be wrong (CZBANK-82).
 *
 * A 429 is called out separately because it is the one failure the user can act on:
 * waiting for the rate-limit window to pass and clicking again will work.
 */
export function describeSignOutFailure(context: Pick<ErrorContext, "response" | "error">): string {
  const status = context.response?.status;

  if (status === 429) {
    // better-auth sends X-Retry-After, not the standard Retry-After. Both are read so a
    // proxy-issued 429 (which uses the standard header) is reported just as well.
    const headers = context.response?.headers;
    const retryAfter = Number(headers?.get("X-Retry-After") ?? headers?.get("Retry-After"));
    const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? `${retryAfter} seconds` : "a moment";
    return `Too many requests. You are still signed in. Please wait ${wait} and try again.`;
  }

  const message = context.error?.message;
  return message ? `${message} You are still signed in.` : "You are still signed in. Please try again.";
}
