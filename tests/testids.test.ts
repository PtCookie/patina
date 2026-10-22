import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const UI_DIR = join(import.meta.dirname, "..", "registry", "ui");

// Parts that render no element (Base UI roots, portals and providers), so a test id would go nowhere.
const NO_ELEMENT = new Set([
  "sheet",
  "sheet-portal",
  "dropdown-menu",
  "dropdown-menu-portal",
  "dropdown-menu-sub",
  "popover",
  "tooltip",
  "tooltip-provider",
]);

// Wrappers and inner parts that do not spread the caller's props, so their test id cannot be replaced.
const FIXED = new Set(["table-container", "checkbox-indicator", "switch-thumb"]);

/** Every `data-slot="x"` attribute and the JSX tag it sits in (from `<` to the closing `>` of that tag). */
function slotTags(source: string): { slot: string; tag: string }[] {
  const found: { slot: string; tag: string }[] = [];
  for (const match of source.matchAll(/data-slot="([a-z-]+)"/g)) {
    const at = match.index ?? 0;
    const start = source.lastIndexOf("<", at);
    // The tag ends at the first `>` that is not part of `=>` and not inside braces.
    let depth = 0;
    let end = at;
    for (; end < source.length; end++) {
      const ch = source[end];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (ch === ">" && depth === 0 && source[end - 1] !== "=") break;
    }
    found.push({ slot: match[1] as string, tag: source.slice(start, end + 1) });
  }
  return found;
}

const files = readdirSync(UI_DIR).filter((name) => name.endsWith(".tsx"));

describe("default test ids", () => {
  it("finds the component sources", () => {
    expect(files.length).toBeGreaterThanOrEqual(25);
    // A broken tag scanner would make the checks below pass on nothing.
    const total = files.reduce((n, file) => n + slotTags(readFileSync(join(UI_DIR, file), "utf8")).length, 0);
    expect(total).toBeGreaterThan(100);
  });

  for (const file of files) {
    const source = readFileSync(join(UI_DIR, file), "utf8");
    // Badge builds its element through useRender and puts the default in its props instead.
    const slots = slotTags(source);

    it(`${file}: every part that renders an element has a data-testid equal to its slot`, () => {
      const wrong = slots
        .filter(({ slot, tag }) =>
          NO_ELEMENT.has(slot) ? tag.includes("data-testid") : !tag.includes(`data-testid="${slot}"`),
        )
        .map(({ slot }) => slot);
      expect(wrong).toEqual([]);
    });

    it(`${file}: the test id comes before the spread props, so a caller's data-testid replaces it`, () => {
      const wrong = slots
        .filter(({ slot, tag }) => {
          const spread = tag.indexOf("{...props}");
          return !FIXED.has(slot) && !NO_ELEMENT.has(slot) && spread !== -1 && tag.indexOf("data-testid") > spread;
        })
        .map(({ slot }) => slot);
      expect(wrong).toEqual([]);
    });
  }

  it("badge sets its default before the caller's props in mergeProps", () => {
    const source = readFileSync(join(UI_DIR, "badge.tsx"), "utf8");
    expect(source).toContain('"data-testid": "badge"');
    expect(source).toContain('mergeProps<"span">(defaults, props)');
  });
});
