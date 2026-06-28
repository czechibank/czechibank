import { type AppError } from "@/lib/errors";
import { type PaginationMeta, type ResponseMeta } from "@/lib/response";
import { toApiResponse, toPaginatedApiResponse } from "@/lib/result-helpers";
import { type ResultAsync } from "neverthrow";

/**
 * Route context shape passed by Next.js App Router to dynamic-segment routes
 * (e.g. `[id]`, `[slug]`). Static routes receive no second argument, so it is
 * optional everywhere.
 */
export type ApiRouteContext<TParams extends Record<string, string> = Record<string, string>> = {
  params: Promise<TParams>;
};

/**
 * A handler owns the neverthrow pipeline for a single endpoint: auth, parsing,
 * validation, service orchestration, and (where relevant) drop evaluation.
 * It returns the success value or an AppError — never a Response.
 */
export type ApiHandler<T, TParams extends Record<string, string> = Record<string, string>> = (
  request: Request,
  context: ApiRouteContext<TParams>,
) => ResultAsync<T, AppError>;

type OnCompleteContext = {
  request: Request;
  status: number;
  durationMs: number;
};

type WithApiHandlerConfig = {
  successMessage: string;
  successStatus?: number;
  meta?: (request: Request) => Partial<ResponseMeta>;
  /**
   * Optional post-response hook (timing, audit). Runs after the Response is
   * built. This is intentionally NOT a replacement for middleware — existing
   * middleware behavior stays untouched.
   */
  onComplete?: (ctx: OnCompleteContext) => void | Promise<void>;
};

/**
 * Wraps a ResultAsync handler into a Next.js route export.
 *
 * Centralizes success/error response shaping via `toApiResponse`, so route
 * files become thin adapters (Swagger + this wrapper) and all checks live in
 * the handler's neverthrow pipeline.
 *
 * Usage:
 *   export const POST = withApiHandler(handleCreateBankAccount, {
 *     successMessage: "Bank account created successfully",
 *     successStatus: 201,
 *   });
 */
export function withApiHandler<T, TParams extends Record<string, string> = Record<string, string>>(
  handler: ApiHandler<T, TParams>,
  config: WithApiHandlerConfig,
) {
  return async (request: Request, context: ApiRouteContext<TParams>): Promise<Response> => {
    const startedAt = Date.now();
    const response = await toApiResponse(
      handler(request, context),
      config.successMessage,
      config.successStatus ?? 200,
      config.meta?.(request),
    );

    if (config.onComplete) {
      await config.onComplete({ request, status: response.status, durationMs: Date.now() - startedAt });
    }

    return response;
  };
}

type WithPaginatedApiHandlerConfig<T, D> = {
  successMessage: string;
  transform: (data: T) => { body: D; pagination: PaginationMeta };
  onComplete?: (ctx: OnCompleteContext) => void | Promise<void>;
};

/**
 * Like `withApiHandler` but for paginated endpoints whose pagination meta lives
 * inside the Result value. Delegates response shaping to `toPaginatedApiResponse`.
 */
export function withPaginatedApiHandler<T, D, TParams extends Record<string, string> = Record<string, string>>(
  handler: ApiHandler<T, TParams>,
  config: WithPaginatedApiHandlerConfig<T, D>,
) {
  return async (request: Request, context: ApiRouteContext<TParams>): Promise<Response> => {
    const startedAt = Date.now();
    const response = await toPaginatedApiResponse(handler(request, context), config.successMessage, config.transform);

    if (config.onComplete) {
      await config.onComplete({ request, status: response.status, durationMs: Date.now() - startedAt });
    }

    return response;
  };
}
