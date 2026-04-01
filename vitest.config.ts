import path from "path";
import { defineConfig } from "vitest/config";

/**
 * Unit + API integration tests. API tests hit a live server (`tests/api/config/config.ts` → HOST).
 * See `tests/api/helpers/fetch-api.ts` and `tests/api/zzz-rate-limits.api.test.ts` for rate-limit handling.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["./tests/api/**/*.test.ts", "./tests/unit/**/*.test.ts"],
    /**
     * Run one test file at a time. Reduces parallel traffic against the same API keys / rate-limit buckets
     * (Better Auth + `src/server-constants.ts`). Also makes `tests/api/zzz-*.test.ts` run after other API files alphabetically.
     */
    fileParallelism: false,
    /** Must exceed `API_TEST_429_COOLDOWN_MS` (default 65s) when `tests/api/helpers/fetch-api.ts` retries on 429. */
    testTimeout: 120_000,
    // projects: [ "./tests/api/**/*.test.ts", "./tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    target: "esnext",
  },
});
