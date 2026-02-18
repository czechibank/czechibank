import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["./tests/api/**/*.test.ts", "./tests/unit/**/*.test.ts"],
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
