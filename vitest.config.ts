import { defineConfig, defaultExclude } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    // Local agent worktrees live inside the project root and contain full copies of the tests.
    exclude: [...defaultExclude, ".claude/**"],
  },
});
