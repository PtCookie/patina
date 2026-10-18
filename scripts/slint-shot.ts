// pnpm slint:shot: render the Slint development gallery (scripts/slint/gallery.slint) to PNG files in slint-shots/,
// in light and dark, for visual review. Needs `slint-viewer` 1.17 or newer on PATH and builds public/ first.
// It renders headless: no window, so hover, focus and popups cannot be checked this way.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const run = (command: string, args: string[]) => spawnSync(command, args, { cwd: root, encoding: "utf8" });

const version = run("slint-viewer", ["--version"]);
if (version.status !== 0) {
  console.error(
    "slint-viewer is not on PATH. Install it from https://github.com/slint-ui/slint/releases (see AGENTS.md).",
  );
  process.exit(1);
}

const build = run("node", ["--import", "tsx", "scripts/build.ts"]);
if (build.status !== 0) {
  console.error(build.stdout, build.stderr);
  process.exit(1);
}

const out = join(root, "slint-shots");
mkdirSync(out, { recursive: true });
const temp = mkdtempSync(join(tmpdir(), "patina-shot-"));
let failed = false;
try {
  for (const mode of ["light", "dark"]) {
    const data = join(temp, `${mode}.json`);
    writeFileSync(data, JSON.stringify({ "Theme.current-mode": mode }));
    for (const component of ["Shell", "Board", "Controls", "Panels"]) {
      const target = join(out, `${component.toLowerCase()}-${mode}.png`);
      const result = run("slint-viewer", [
        "-L",
        "patina=public/slint/patina.slint",
        "--component",
        component,
        "--load-data",
        data,
        "--screenshot",
        target,
        "scripts/slint/gallery.slint",
      ]);
      // The viewer prints a warning for an unknown property and an error for a compile problem.
      if (result.status !== 0 || /error/i.test(result.stderr)) {
        failed = true;
        console.error(`${component} (${mode}) failed:\n${result.stderr}`);
      } else {
        console.log(`slint-shots/${component.toLowerCase()}-${mode}.png`);
      }
    }
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
