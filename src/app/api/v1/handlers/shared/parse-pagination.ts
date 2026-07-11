const POSITIVE_INT_RE = /^\d+$/;

function parseStrictInt(raw: string | null): number | undefined {
  if (raw === null) return undefined;
  const trimmed = raw.trim();
  if (!POSITIVE_INT_RE.test(trimmed)) return undefined;
  const n = Number(trimmed);
  return Number.isSafeInteger(n) ? n : undefined;
}

export type ParsePaginationOptions = {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
};

/**
 * Parses page/limit query params with clamping semantics: malformed values
 * (`"abc"`, `"1abc"`, `""`) fall back to the defaults and out-of-range values
 * are clamped to the nearest bound, so the result is always a valid positive
 * integer (never NaN — `Math.max(1, parseInt("abc"))` is NaN, which this
 * helper exists to prevent). Endpoints that must *reject* invalid pagination
 * (bank accounts, transactions) validate in their service layer instead.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  { defaultPage = 1, defaultLimit = 50, maxLimit = 100 }: ParsePaginationOptions = {},
): { page: number; limit: number } {
  const page = parseStrictInt(searchParams.get("page")) ?? defaultPage;
  const limit = parseStrictInt(searchParams.get("limit")) ?? defaultLimit;
  return {
    page: Math.max(1, page),
    limit: Math.min(maxLimit, Math.max(1, limit)),
  };
}
