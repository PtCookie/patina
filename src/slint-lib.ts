// Reads the hand-written Slint library (slint/**/*.slint) so the build can serve it next to the generated tokens.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** The generated tokens file. The build also writes a copy next to the sources so editors can resolve the import. */
export const GENERATED_TOKENS = "tokens.slint";

/**
 * Path below public/ (`slint/components/button.slint`) to file content, for every hand-written .slint file under
 * slint/. The generated `tokens.slint` copy in that folder is skipped: the build produces it from the tokens.
 */
export function loadSlintLibrary(root: URL): Record<string, string> {
  const base = fileURLToPath(new URL("slint/", root));
  const files: Record<string, string> = {};
  const walk = (dir: string, prefix: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name), `${prefix}${entry.name}/`);
      else if (entry.isFile() && entry.name.endsWith(".slint") && `${prefix}${entry.name}` !== GENERATED_TOKENS) {
        files[`slint/${prefix}${entry.name}`] = readFileSync(join(dir, entry.name), "utf8");
      }
    }
  };
  walk(base, "");
  return files;
}
