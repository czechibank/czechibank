/**
 * HTTP helpers used by `tests/api/**`.
 *
 * `fetchApi()` is the default helper for integration tests that talk to a running server.
 * When the server responds with `429 Too Many Requests`, the helper can wait for the
 * rate-limit window to reset and then retry the request once.
 *
 * `fetchWithoutRateLimitRetry()` keeps the raw behavior and is used by tests that need
 * to assert on the original `429` response directly.
 *
 * These environment variables affect only the test runner:
 * | Variable | Effect |
 * |----------|--------|
 * | `API_TEST_NO_429_RETRY=1` | Disables the cooldown retry |
 * | `API_TEST_429_MAX_RETRIES` | Number of retries after a `429` (default `1`) |
 * | `API_TEST_429_COOLDOWN_MS` | Wait time before retry (default `65000`) |
 */

const RATE_LIMIT_COOLDOWN_MS = Number(process.env.API_TEST_429_COOLDOWN_MS ?? "65000");
const MAX_429_RETRIES = Number(process.env.API_TEST_429_MAX_RETRIES ?? "1");

function shouldRetryOn429(): boolean {
  return process.env.API_TEST_NO_429_RETRY !== "1" && MAX_429_RETRIES > 0;
}

function shortUrl(input: string | URL): string {
  const s = typeof input === "string" ? input : input.toString();
  return s.length > 80 ? `${s.slice(0, 77)}…` : s;
}

/**
 * Default HTTP helper for API integration tests.
 *
 * Returns the original response immediately for non-`429` statuses.
 * For `429`, logs the wait, sleeps for the configured cooldown, and retries.
 */
export async function fetchApi(input: string | URL, init?: RequestInit): Promise<Response> {
  let response = await fetch(input, init);
  if (response.status !== 429 || !shouldRetryOn429()) {
    return response;
  }
  const cooldownSec = Math.round(RATE_LIMIT_COOLDOWN_MS / 1000);
  console.warn(
    `[api tests][429 retry] Got 429 from ${shortUrl(input)}. Waiting ${cooldownSec}s for rate-limit window, then retrying (up to ${MAX_429_RETRIES} time(s)). Set API_TEST_NO_429_RETRY=1 to skip wait.`,
  );
  for (let attempt = 0; attempt < MAX_429_RETRIES; attempt++) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_COOLDOWN_MS));
    response = await fetch(input, init);
    if (response.status !== 429) {
      console.warn(`[api tests][429 retry] Retry succeeded (${response.status}) for ${shortUrl(input)}`);
      return response;
    }
  }
  console.warn(`[api tests][429 retry] Still 429 after cooldown for ${shortUrl(input)}`);
  return response;
}

/**
 * Raw `fetch` without the `429` cooldown retry.
 *
 * Use this in tests that intentionally verify rate-limiting behavior.
 */
export async function fetchWithoutRateLimitRetry(input: string | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, init);
}
