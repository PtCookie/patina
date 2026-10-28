import { resolve } from "node:path";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tsEslint from "typescript-eslint";
import pluginReact from "@eslint-react/eslint-plugin";
import pluginVitest from "@vitest/eslint-plugin";

export default defineConfig([
  includeIgnoreFile(resolve(import.meta.dirname, ".gitignore")),
  // The design-system snapshot (previews, bundle.js) and generated output are not linted.
  { ignores: ["design-system/**", "public/**"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  tsEslint.configs.strict,
  tsEslint.configs.stylistic,
  { files: ["**/*.{jsx,tsx}"], ...pluginReact.configs.strict },
  { files: ["tests/**"], ...pluginVitest.configs.recommended },
]);
