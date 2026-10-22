import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkDerived, DERIVED, evaluateRecipe, expectedCardHover, mixOklch } from "../src/derived";
import { parseTokens } from "../src/tokens";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const snapshot: unknown = JSON.parse(read("design-system/tokens.json"));
const set = parseTokens(snapshot);

interface Doc {
  color: { tokens: { name: string; value: string | { light: string; dark: string } }[] };
  shadow: { tokens: { name: string; value: { light: string; dark: string } }[] };
}

/** Parses a copy of the snapshot after `mutate` edited it, and returns the derived-token issues. */
function issuesAfter(mutate: (doc: Doc) => void) {
  const doc = structuredClone(snapshot) as Doc;
  mutate(doc);
  return checkDerived(parseTokens(doc));
}

const colorValue = (doc: Doc, name: string) => {
  const value = doc.color.tokens.find((token) => token.name === name)?.value;
  if (typeof value !== "object") throw new Error(`${name} is not a themed token`);
  return value;
};

describe("checkDerived on the snapshot", () => {
  it("finds every derived token consistent with its base tokens", () => {
    expect(checkDerived(set)).toEqual([]);
  });

  it("covers the 22 recipes of the AGENTS.md table plus shadow-card-hover", () => {
    expect(Object.keys(DERIVED)).toHaveLength(22);
    expect(set.shadow.tokens.some((token) => token.name === "shadow-card-hover")).toBe(true);
  });
});

describe("recipes", () => {
  it("multiplies the base alpha, so input@30% in dark is 4.5%", () => {
    const recipe = DERIVED["outline-hover"]?.dark;
    if (!recipe) throw new Error("missing recipe");
    expect(evaluateRecipe(set, recipe, "dark").alpha).toBeCloseTo(0.045, 12);
  });

  it("derives control and control-strong from input", () => {
    const control = evaluateRecipe(set, DERIVED.control?.dark ?? { kind: "transparent" }, "dark");
    const strong = evaluateRecipe(set, DERIVED["control-strong"]?.dark ?? { kind: "transparent" }, "dark");
    expect(control.alpha).toBeCloseTo(0.075, 12);
    expect(strong.alpha).toBeCloseTo(0.135, 12);
  });

  it("recomputes secondary-hover with the oklch mix (5% toward foreground)", () => {
    const recipe = DERIVED["secondary-hover"]?.light;
    if (!recipe) throw new Error("missing recipe");
    const mixed = evaluateRecipe(set, recipe, "light");
    // 0.963 + 0.05 * (0.148 - 0.963), hue 197.1 -> 228.8 along the shorter arc.
    expect(mixed.l).toBeCloseTo(0.92225, 10);
    expect(mixed.c).toBeCloseTo(0.0021, 10);
    expect(mixed.h).toBeCloseTo(198.685, 10);
    expect(mixed.alpha).toBe(1);
  });
});

describe("mixOklch", () => {
  const a = (h: number, c = 0.1) => ({ l: 0.5, c, h, alpha: 1 });

  it("interpolates L and C linearly", () => {
    const mixed = mixOklch({ l: 0.2, c: 0.1, h: 100, alpha: 1 }, { l: 0.6, c: 0.3, h: 100, alpha: 1 }, 25);
    expect(mixed.l).toBeCloseTo(0.3, 12);
    expect(mixed.c).toBeCloseTo(0.15, 12);
  });

  it("takes the shorter hue arc, including across 0/360", () => {
    expect(mixOklch(a(350), a(10), 50).h).toBeCloseTo(0, 10);
    expect(mixOklch(a(10), a(350), 50).h).toBeCloseTo(0, 10);
    expect(mixOklch(a(100), a(160), 50).h).toBeCloseTo(130, 10);
    expect(mixOklch(a(160), a(100), 25).h).toBeCloseTo(145, 10);
  });

  it("uses the other colour's hue when one side is achromatic", () => {
    expect(mixOklch(a(200, 0), a(90), 50).h).toBe(90);
    expect(mixOklch(a(90), a(200, 0), 50).h).toBe(90);
  });

  it("returns an opaque colour", () => {
    expect(mixOklch(a(0), a(0), 50).alpha).toBe(1);
  });
});

describe("checkDerived detects drift", () => {
  it("reports a stale alpha derivative after its base token changed", () => {
    // Change `primary` in light; `primary-hover` still carries the old colour, and so does `primary-muted`, whose
    // base `link` is the same colour in light.
    const issues = issuesAfter((doc) => (colorValue(doc, "primary").light = "oklch(0.6 0.118 165.612)"));
    expect(issues.map(({ token, theme }) => `${token} ${theme}`).sort()).toEqual([
      "primary-hover light",
      "primary-muted light",
    ]);
    const hover = issues.find(({ token }) => token === "primary-hover");
    expect(hover?.message).toMatch(/L differ: expected oklch\(0\.6 0\.118 165\.612 \/ 80%\)/);
  });

  it("reports a wrong alpha", () => {
    const issues = issuesAfter((doc) => (colorValue(doc, "kbd").dark = "oklch(0.723 0.014 214.4 / 12%)"));
    expect(issues).toEqual([expect.objectContaining({ token: "kbd", theme: "dark" })]);
    expect(issues[0]?.message).toMatch(/alpha differ/);
  });

  it("reports a stale oklch mix", () => {
    const issues = issuesAfter((doc) => (colorValue(doc, "secondary-hover").light = "oklch(0.9 0.002 198.685)"));
    expect(issues).toEqual([expect.objectContaining({ token: "secondary-hover", theme: "light" })]);
  });

  it("tolerates the rounding tokens.json prints", () => {
    // 0.92225 stored as 0.922 is fine; 0.923 is one rounding step off and is not.
    expect(issuesAfter((doc) => (colorValue(doc, "secondary-hover").light = "oklch(0.922 0.002 198.685)"))).toEqual([]);
    expect(
      issuesAfter((doc) => (colorValue(doc, "secondary-hover").light = "oklch(0.923 0.002 198.685)")),
    ).toHaveLength(1);
  });

  it("requires references to stay references", () => {
    const concrete = issuesAfter((doc) => (colorValue(doc, "ghost-hover").light = "oklch(0.963 0.002 197.1)"));
    expect(concrete).toEqual([
      expect.objectContaining({
        token: "ghost-hover",
        theme: "light",
        message: expect.stringContaining("expected {muted}"),
      }),
    ]);
    const wrong = issuesAfter((doc) => (colorValue(doc, "switch-thumb").dark = "{background}"));
    expect(wrong).toEqual([expect.objectContaining({ token: "switch-thumb", theme: "dark" })]);
  });

  it("requires a concrete value where a recipe computes one", () => {
    const issues = issuesAfter((doc) => (colorValue(doc, "control").light = "{input}"));
    expect(issues).toEqual([
      expect.objectContaining({ token: "control", theme: "light", message: expect.stringContaining("concrete oklch") }),
    ]);
  });

  it("requires outline-fill to be transparent in dark", () => {
    const issues = issuesAfter((doc) => (colorValue(doc, "outline-fill").dark = "oklch(0 0 0 / 5%)"));
    expect(issues).toEqual([expect.objectContaining({ token: "outline-fill", theme: "dark" })]);
  });

  it("reports a stale shadow-card-hover", () => {
    const issues = issuesAfter((doc) => {
      const card = doc.shadow.tokens.find((token) => token.name === "shadow-card");
      if (card) card.value.dark = card.value.dark.replace("10%", "12%");
    });
    expect(issues).toEqual([expect.objectContaining({ token: "shadow-card-hover", theme: "dark" })]);
  });

  it("reports a missing derived token", () => {
    const issues = issuesAfter((doc) => (doc.color.tokens = doc.color.tokens.filter((token) => token.name !== "kbd")));
    expect(issues).toEqual([{ token: "kbd", theme: null, message: "derived token is missing from tokens.json" }]);
  });
});

describe("expectedCardHover", () => {
  it("doubles the ring alpha and leaves the other layers alone", () => {
    expect(expectedCardHover("0 0 0 1px oklch(0.1 0 0 / 5%), 0 4px 6px -1px rgba(0, 0, 0, 0.1)")).toBe(
      "0 0 0 1px oklch(0.1 0 0 / 10%), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    );
  });

  it("returns null when there is no ring alpha", () => {
    expect(expectedCardHover("0 1px 2px rgba(0, 0, 0, 0.05)")).toBeNull();
  });
});

describe("AGENTS.md derived-token table", () => {
  // The table in AGENTS.md is the specification; the recipes in src/derived.ts must name the same tokens.
  const agents = read("AGENTS.md");
  const section = agents.slice(agents.indexOf("### Derived tokens"), agents.indexOf("### Contrast baselines"));

  const documented = section
    .split("\n")
    .filter((line) => /^\| `/.test(line))
    .flatMap((line) => {
      const first = line.split("|")[1] ?? "";
      return [...first.matchAll(/`([^`]+)`/g)].flatMap((match) => {
        const text = match[1] ?? "";
        if (!text.includes("/")) return [text];
        // `success/warning/info-muted` shares one suffix.
        const parts = text.split("/");
        const last = parts[parts.length - 1] ?? "";
        const suffix = last.slice(last.indexOf("-"));
        return parts.map((part, index) => (index === parts.length - 1 ? part : `${part}${suffix}`));
      });
    });

  it("lists exactly the tokens that have a recipe", () => {
    expect([...documented].sort()).toEqual([...Object.keys(DERIVED), "shadow-card-hover"].sort());
  });

  it("only names tokens that exist in tokens.json", () => {
    expect(Object.keys(DERIVED).filter((name) => !set.colorIndex.has(name))).toEqual([]);
  });
});
