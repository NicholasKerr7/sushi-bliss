import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@vitest/pretty-format": "@vitest/pretty-format/dist/index.js",
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/lib/**/*.ts", "src/data/**/*.ts"],
    },
  },
});
