import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { generate } from "../src/generate";
import { loadSlintLibrary } from "../src/slint-lib";
import { parseTokens } from "../src/tokens";

// Renders the development gallery with the real `slint-viewer` (headless, 1.17 or newer). Skipped where the viewer
// is not installed: it needs a download from the Slint releases.
const hasViewer = spawnSync("slint-viewer", ["--version"]).status === 0;

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();

const dir = mkdtempSync(join(tmpdir(), "patina-render-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function installLibrary(): string {
  const files = generate(set, version, [], undefined, loadSlintLibrary(root));
  for (const [path, text] of Object.entries(files).filter(([name]) => name.startsWith("slint/"))) {
    const target = join(dir, "library", path.slice("slint/".length));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  return join(dir, "library", "patina.slint");
}

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

describe.skipIf(!hasViewer)("slint-viewer", () => {
  const entry = hasViewer ? installLibrary() : "";
  const gallery = new URL("scripts/slint/gallery.slint", root).pathname;

  function render(component: string, mode: "light" | "dark"): Buffer {
    const data = join(dir, `${mode}.json`);
    writeFileSync(data, JSON.stringify({ "Theme.current-mode": mode }));
    const out = join(dir, `${component}-${mode}.png`);
    const result = spawnSync(
      "slint-viewer",
      ["-L", `patina=${entry}`, "--component", component, "--load-data", data, "--screenshot", out, gallery],
      { encoding: "utf8" },
    );
    expect(result.stderr).not.toMatch(/error/i);
    expect(result.status).toBe(0);
    return readFileSync(out);
  }

  it("renders the shell and the board as PNG files", () => {
    for (const component of ["Shell", "Board"]) {
      expect(render(component, "light").subarray(0, 4).equals(PNG)).toBe(true);
    }
  });

  it("renders the dark theme differently from the light one", () => {
    expect(render("Shell", "dark").equals(render("Shell", "light"))).toBe(false);
  });

  it("keeps the Shell at the size of the DesktopShell preview", () => {
    const png = render("Shell", "light");
    // The PNG header stores width and height as big-endian 32-bit integers at offsets 16 and 20.
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([960, 440]);
  });
});
