import { fileURLToPath } from "node:url";
import { defineConfig, defaultExclude } from "vitest/config";

export default defineConfig({
  resolve: {
    // The registry sources import `@/lib/utils`; here it is the stand-in in registry/lib.
    alias: { "@": fileURLToPath(new URL("./registry", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    // Local agent worktrees live inside the project root and contain full copies of the tests.
    exclude: [...defaultExclude, ".claude/**"],
  },
});
