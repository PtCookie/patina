// Reads the hand-written Android library (android/**/*.kt) and the Phosphor SVGs that PatinaIcons draws.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ANDROID_ICONS } from "./emit/android";

/** Path below public/ (`android/components/PatinaButton.kt`) to content, for every .kt file under android/. */
export function loadAndroidLibrary(root: URL): Record<string, string> {
  const base = fileURLToPath(new URL("android/", root));
  const files: Record<string, string> = {};
  const walk = (dir: string, prefix: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name), `${prefix}${entry.name}/`);
      else if (entry.isFile() && entry.name.endsWith(".kt")) {
        files[`android/${prefix}${entry.name}`] = readFileSync(join(dir, entry.name), "utf8");
      }
    }
  };
  walk(base, "");
  return files;
}

/** The SVG sources of the icons in ANDROID_ICONS, from the `@phosphor-icons/core` dev dependency. */
export function loadPhosphorIcons(root: URL): Record<string, string> {
  return Object.fromEntries(
    ANDROID_ICONS.map((name) => [
      name,
      readFileSync(new URL(`node_modules/@phosphor-icons/core/assets/regular/${name}.svg`, root), "utf8"),
    ]),
  );
}
