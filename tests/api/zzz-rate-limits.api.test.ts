/**
 * End-of-suite checks for HTTP `429` / `RATE_LIMIT_EXCEEDED`.
 *
 * This file runs late in the API suite so the rate-limit assertions do not consume
 * request budget needed by the rest of the tests.
 *
 * Included checks:
 * 1. Per-key limit on `GET /apikey` using the seeded `rate.limited@example.com` user.
 * 2. Global auth limit on `GET /user`, enabled only when the target host is expected
 *    to enforce a tight server-wide limit.
 *
 * The global test is controlled by `API_TEST_EXPECT_GLOBAL_RATE_LIMIT`:
 * - unset / not `"1"`: skip the global test
 * - `"1"`: run the global test
 *
 * A `console.warn` is printed when the global test is disabled so the terminal output
 * explains why the suite contains a skipped test.
 */

import { describe, expect, it, type TestContext } from "vitest";
import { apiKey } from "../../shared/fixtures";
import { config } from "./config/config";
import { fetchWithoutRateLimitRetry } from "./helpers/fetch-api";

const BASE = `${config.BASE_URL}/api/v1`;

// Print an explicit log message because Vitest often shows only "N skipped" in summaries.
if (process.env.API_TEST_EXPECT_GLOBAL_RATE_LIMIT !== "1") {
  console.warn(
    "[api tests][skip] Global rate-limit test not run. Set API_TEST_EXPECT_GLOBAL_RATE_LIMIT=1 against a host with tight limits (e.g. ENV=PROD). CI uses ENV=CI (high limit), so this stays off by default.",
  );
}

describe("Rate limits (end of suite — may exhaust request budgets)", () => {
  describe("Per-key GET /apikey (fixture rateLimitMax: 2)", () => {
    it("returns 429 after key-specific limit", async (ctx: TestContext) => {
      const key = apiKey.rateLimited;

      let lastStatus = 0;
      for (let i = 0; i < 12; i++) {
        const res = await fetchWithoutRateLimitRetry(`${BASE}/apikey`, {
          headers: { "X-API-Key": key },
        });
        lastStatus = res.status;
        if (i === 0 && res.status === 401) {
          const reason =
            "Per-key rate-limit test skipped: fixture API key unknown on this server (401). Seed DB with pnpm db:seed:users so user rate.limited@example.com and key exist.";
          console.warn(`[api tests][skip] ${reason}`);
          ctx.skip(reason);
          return;
        }
        if (res.status === 429) {
          const data = await res.json();
          expect(data.success).toBe(false);
          expect(data.error.code).toBe("RATE_LIMIT_EXCEEDED");
          break;
        }
        expect(res.status).toBe(200);
      }

      expect(lastStatus, "Expected 429 — ensure seed user rate.limited exists (pnpm db:seed:users)").toBe(429);
    });
  });

  describe.skipIf(process.env.API_TEST_EXPECT_GLOBAL_RATE_LIMIT !== "1")(
    "Global limit (opt-in, PROD-tight hosts)",
    () => {
      it("returns 429 after global auth window", async () => {
        const key = apiKey.appAdmin;
        let saw429 = false;

        for (let i = 0; i < 45; i++) {
          const res = await fetchWithoutRateLimitRetry(`${BASE}/user`, {
            headers: { "X-API-Key": key },
          });
          if (res.status === 429) {
            saw429 = true;
            const data = await res.json();
            expect(data.success).toBe(false);
            expect(data.error.code).toBe("RATE_LIMIT_EXCEEDED");
            break;
          }
          expect(res.status).toBe(200);
        }

        expect(
          saw429,
          "Set API_TEST_EXPECT_GLOBAL_RATE_LIMIT=1 only when testing a host with tight global limits (e.g. ENV=PROD).",
        ).toBe(true);
      });
    },
  );
});
