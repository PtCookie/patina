import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkContrast, contrastReport, measure, REQUIREMENTS, statedMismatches } from "../src/contrast";
import { parseTokens, THEMES } from "../src/tokens";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const snapshot: unknown = JSON.parse(read("design-system/tokens.json"));
const set = parseTokens(snapshot);

interface Doc {
  color: { tokens: { name: string; value: string | { light: string; dark: string } }[] };
}

/** Parses a copy of the snapshot after `mutate` edited it. */
function mutated(mutate: (doc: Doc) => void) {
  const doc = structuredClone(snapshot) as Doc;
  mutate(doc);
  return parseTokens(doc);
}

const requirement = (id: string) => {
  const found = REQUIREMENTS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`no requirement ${id}`);
  return found;
};

describe("contrast baselines on the snapshot", () => {
  it("meets every enforced baseline in both themes", () => {
    expect(checkContrast(set)).toEqual([]);
  });

  it("measures each requirement once per theme", () => {
    const ids = REQUIREMENTS.map((candidate) => candidate.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(contrastReport(set)).toHaveLength(REQUIREMENTS.length * THEMES.length);
  });

  it("matches the ratios printed in the usage notes (rounded to one decimal)", () => {
    expect(statedMismatches(set)).toEqual([]);
  });

  it("keeps the claims that were corrected after the first measurement", () => {
    // The first usage notes promised foreground >= 15:1 in both themes and link >= 6:1 in dark. Measured: dark
    // foreground on muted/accent is 14.25:1 and dark link on muted is 5.9989:1, so the notes now say 14 and 5.9.
    const ratio = (id: string, theme: "light" | "dark") => measure(set, requirement(id), theme);
    expect(ratio("foreground on muted", "dark")).toBeCloseTo(14.2508, 4);
    expect(ratio("link on muted", "dark")).toBeCloseTo(5.9989, 4);
    expect(requirement("foreground on muted").min.dark).toBe(14);
    expect(requirement("link on muted").min.dark).toBe(5.9);
  });
});

describe("measure", () => {
  it("computes the guarantees from the README with real numbers", () => {
    const ratio = (id: string, theme: "light" | "dark") => measure(set, requirement(id), theme);
    expect(ratio("muted-foreground on muted", "light")).toBeGreaterThanOrEqual(4.7);
    expect(ratio("destructive on destructive-muted (over background)", "light")).toBeGreaterThanOrEqual(4.8);
    expect(ratio("link on background", "dark")).toBeGreaterThanOrEqual(6);
    expect(ratio("ring on muted", "dark")).toBeGreaterThanOrEqual(3);
  });

  it("composites a tint over the surface it sits on", () => {
    const overBackground = measure(set, requirement("destructive on destructive-muted (over background)"), "dark");
    const overCard = measure(set, requirement("destructive on destructive-muted (over card)"), "dark");
    expect(overBackground).toBeCloseTo(5.28, 2);
    expect(overCard).toBeCloseTo(4.5, 1);
    expect(overCard).toBeLessThan(overBackground);
  });
});

describe("checkContrast detects regressions", () => {
  it("fails when a text colour loses contrast", () => {
    const lighter = mutated((doc) => {
      const token = doc.color.tokens.find((candidate) => candidate.name === "muted-foreground");
      if (token && typeof token.value === "object") token.value.light = "oklch(0.62 0.021 213.5)";
    });
    const failing = checkContrast(lighter).map(({ id, theme }) => `${id} ${theme}`);
    expect(failing).toEqual(
      expect.arrayContaining([
        "muted-foreground on background light",
        "muted-foreground on muted light",
        "muted-foreground on sidebar light",
      ]),
    );
    expect(failing.every((entry) => entry.startsWith("muted-foreground") && entry.endsWith("light"))).toBe(true);
  });

  it("fails when the focus ring becomes too faint", () => {
    const faint = mutated((doc) => {
      const token = doc.color.tokens.find((candidate) => candidate.name === "ring");
      if (token && typeof token.value === "object") token.value.dark = "oklch(0.45 0.02 214)";
    });
    expect(checkContrast(faint).map(({ id }) => id)).toContain("ring on background");
  });

  it("reports the measured ratio and the rule it broke", () => {
    const broken = mutated((doc) => {
      const token = doc.color.tokens.find((candidate) => candidate.name === "link");
      if (token && typeof token.value === "object") token.value.light = "oklch(0.7 0.118 165.612)";
    });
    const issue = checkContrast(broken).find(({ id, theme }) => id === "link on background" && theme === "light");
    expect(issue?.message).toMatch(/^\d\.\d\d:1 is below 4\.8:1 \(tokens\.json usage of `link`\)$/);
  });

  it("notices when a printed ratio no longer matches", () => {
    const shifted = mutated((doc) => {
      const token = doc.color.tokens.find((candidate) => candidate.name === "primary-foreground");
      if (token && typeof token.value === "object") token.value.light = "oklch(0.93 0.021 166.113)";
    });
    expect(statedMismatches(shifted).map(({ requirement: { id }, theme }) => `${id} ${theme}`)).toEqual([
      "primary-foreground on primary light",
    ]);
  });
});

describe("usage notes", () => {
  // Every `N:1` in a colour token's usage note must be a number one of that token's requirements knows about.
  // A note that gains or changes a ratio without a matching requirement fails here.
  it("only state ratios that have a requirement", () => {
    const unknown: string[] = [];
    for (const token of set.colors) {
      const stated = [...token.usage.matchAll(/(\d+(?:\.\d+)?):1/g)].map((match) => Number(match[1]));
      if (stated.length === 0) continue;
      const known = new Set(
        REQUIREMENTS.filter((candidate) => candidate.foreground === token.name).flatMap((candidate) => [
          ...Object.values(candidate.min),
          ...Object.values(candidate.stated ?? {}),
        ]),
      );
      for (const ratio of stated) if (!known.has(ratio)) unknown.push(`${token.name}: ${ratio}:1`);
    }
    expect(unknown).toEqual([]);
  });

  it("belong to tokens that have a requirement", () => {
    const withRatios = set.colors.filter((token) => /\d:1/.test(token.usage)).map((token) => token.name);
    const covered = new Set(REQUIREMENTS.map((candidate) => candidate.foreground));
    expect(withRatios.filter((name) => !covered.has(name))).toEqual([]);
  });
});
