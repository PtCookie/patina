import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseTokens, resolveColor, THEMES, TokenError, type TokenSet } from "../src/tokens";

const snapshot: unknown = JSON.parse(readFileSync(new URL("../design-system/tokens.json", import.meta.url), "utf8"));

/** A minimal valid document; tests mutate a deep copy of it. */
function minimal(): Record<string, unknown> {
  const group = { note: "n", tokens: [{ name: "space-1", value: "4px", usage: "u" }] };
  return {
    name: "T",
    version: 1,
    meta: { source: "s" },
    color: {
      themes: [
        { id: "light", name: "Light" },
        { id: "dark", name: "Dark" },
      ],
      tokens: [
        { name: "a", value: { light: "oklch(1 0 0)", dark: "oklch(0 0 0)" }, usage: "u" },
        { name: "b", value: { light: "{a}", dark: "{a}" }, usage: "u" },
        { name: "c", value: "oklch(0.5 0.1 160 / 40%)", usage: "u" },
      ],
    },
    type: {
      fonts: [{ family: "F", file: "f.woff2", weight: "400", style: "normal" }],
      families: { sans: '"F", sans-serif' },
      groups: [
        {
          name: "Text",
          family: "sans",
          styles: [{ name: "body", fontSize: "14px", lineHeight: "20px", fontWeight: 400 }],
        },
      ],
    },
    spacing: group,
    radius: group,
    size: group,
    shadow: {
      note: "n",
      tokens: [{ name: "shadow-card", value: { light: "0 0 #000", dark: "0 0 #fff" }, usage: "u" }],
    },
  };
}

const clone = <T>(value: T): T => structuredClone(value);
type Mutable = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

describe("parseTokens on the snapshot", () => {
  const set = parseTokens(snapshot);

  it("reads the document", () => {
    expect(set.name).toBe("Patina");
    expect(set.themes.map((theme) => theme.id)).toEqual(["light", "dark"]);
    expect(set.colors.length).toBeGreaterThan(50);
    expect(set.colorIndex.size).toBe(set.colors.length);
    expect(Object.keys(set.type.families)).toEqual(["sans", "heading", "mono", "mono-ko", "serif"]);
  });

  it("keeps single-string colours shared by both themes", () => {
    const chart = set.colorIndex.get("chart-3");
    expect(chart?.themed).toBe(false);
    expect(chart?.values.light).toEqual(chart?.values.dark);
    expect(set.colorIndex.get("background")?.themed).toBe(true);
  });

  it("resolves every colour to a concrete oklch value in both themes", () => {
    for (const token of set.colors) {
      for (const theme of THEMES) {
        const color = resolveColor(set, token.name, theme);
        expect(color.l).toBeGreaterThanOrEqual(0);
        expect(color.alpha).toBeGreaterThanOrEqual(0);
        expect(color.alpha).toBeLessThanOrEqual(1);
      }
    }
  });

  it("follows references per theme", () => {
    // `ghost-hover` is `{muted}` in light and a translucent value in dark.
    expect(resolveColor(set, "ghost-hover", "light")).toEqual(resolveColor(set, "muted", "light"));
    expect(resolveColor(set, "ghost-hover", "dark")).not.toEqual(resolveColor(set, "muted", "dark"));
  });

  it("keeps fractional alpha such as 4.5%", () => {
    expect(resolveColor(set, "tab-active", "dark").alpha).toBeCloseTo(0.045, 12);
    expect(resolveColor(set, "control", "dark").alpha).toBeCloseTo(0.075, 12);
  });

  it("parses scalar groups, shadows per theme and text styles", () => {
    expect(set.spacing.tokens.find((token) => token.name === "space-1.5")?.values.light).toBe("6px");
    const shadow = set.shadow.tokens.find((token) => token.name === "shadow-card");
    expect(shadow?.themed).toBe(true);
    expect(shadow?.values.light).not.toBe(shadow?.values.dark);
    expect(set.type.groups.map((group) => group.name)).toEqual(["Heading", "Text", "Mono", "Compact", "Serif"]);
  });
});

describe("parseTokens errors", () => {
  const parse = (mutate: (doc: Mutable) => void): TokenSet => {
    const doc = clone(minimal()) as Mutable;
    mutate(doc);
    return parseTokens(doc);
  };

  it("accepts the minimal document", () => {
    expect(parse(() => undefined).colors).toHaveLength(3);
  });

  it("names the path of a bad colour value", () => {
    expect(() => parse((doc) => (doc.color.tokens[0].value.dark = "rgb(0 0 0)"))).toThrow(
      /color\.tokens\[0\]\.value\.dark: Invalid oklch\(\) value/,
    );
  });

  it("rejects unresolved references", () => {
    expect(() => parse((doc) => (doc.color.tokens[1].value = "{missing}"))).toThrow(/unresolved reference \{missing\}/);
  });

  it("rejects circular references", () => {
    expect(() => {
      parse((doc) => {
        doc.color.tokens[0].value = "{b}";
      });
    }).toThrow(/circular reference/);
  });

  it("rejects malformed references and token names", () => {
    expect(() => parse((doc) => (doc.color.tokens[1].value = "{Bad Name}"))).toThrow(/invalid reference/);
    expect(() => parse((doc) => (doc.color.tokens[0].name = "Bad Name"))).toThrow(/invalid token name/);
  });

  it("rejects duplicate token names", () => {
    expect(() => parse((doc) => (doc.color.tokens[1].name = "a"))).toThrow(/duplicate token "a"/);
    expect(() => parse((doc) => doc.spacing.tokens.push({ name: "space-1", value: "5px", usage: "u" }))).toThrow(
      /spacing\.tokens\[1\].*duplicate token/,
    );
  });

  it("requires both themes and rejects unknown theme keys", () => {
    expect(() => parse((doc) => delete doc.color.tokens[0].value.dark)).toThrow(/value\.dark: expected a string/);
    expect(() => parse((doc) => (doc.color.tokens[0].value.sepia = "oklch(1 0 0)"))).toThrow(/unknown theme key/);
  });

  it("rejects unknown themes and wrong types", () => {
    expect(() => parse((doc) => (doc.color.themes[0].id = "sepia"))).toThrow(/unknown theme sepia/);
    expect(() => parse((doc) => (doc.version = "1"))).toThrow(/version: expected a number/);
    expect(() => parse((doc) => delete doc.type)).toThrow(/type: expected an object/);
  });

  it("rejects a text group that names an unknown family", () => {
    expect(() => parse((doc) => (doc.type.groups[0].family = "serif"))).toThrow(/unknown family "serif"/);
  });

  it("throws TokenError", () => {
    expect(() => parseTokens(null)).toThrow(TokenError);
  });
});
