import { errorResponse } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handler wrapper for POST endpoints that parses JSON and returns 400 on error.
 * Usage:
 *   export const POST = withValidatedJSON(async (request, body) => { ... });
 */
export function withValidatedJSON<TBody = any, TResponse = Response | NextResponse>(
  handler: (request: NextRequest, body: TBody) => Promise<TResponse> | TResponse,
) {
  return async function (request: NextRequest): Promise<TResponse> {
    let body: TBody;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Handled error in withValidatedJSON:", error);
      return NextResponse.json(errorResponse("Invalid JSON", "400"), { status: 400 }) as TResponse;
    }
    return handler(request, body);
  };
}
