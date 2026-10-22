import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, type Linear } from "../src/color";
import { ANDROID_PACKAGE, colorKt, shapeKt, typeKt } from "../src/emit/android";
import { parseTokens } from "../src/tokens";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();
const androidMd = read("design-system/Android.md");

const color = colorKt(set, version);
const type = typeKt(set, version);
const shape = shapeKt(set, version);

/** `role = Color(0xFFRRGGBB)` lines of one `val Name = ...Scheme(` block. */
function colorBlock(source: string, name: string): Record<string, string> {
  const start = source.indexOf(`val ${name} =`);
  const end = source.indexOf("\n)", start);
  return Object.fromEntries(
    [...source.slice(start, end).matchAll(/^\s+(\w+) = Color\(0xFF([0-9A-F]{6})\),?$/gm)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

describe("Color.kt", () => {
  it("keeps every line within the 120 characters that Kotlin linters expect", () => {
    for (const line of color.split("\n")) expect(line.length).toBeLessThanOrEqual(120);
  });

  it.each(["PatinaLight", "PatinaDark"])("%s equals the Kotlin block published in Android.md", (name) => {
    const generated = colorBlock(color, name);
    expect(Object.keys(generated)).toHaveLength(36);
    expect(generated).toEqual(colorBlock(androidMd, name));
  });

  const KEYS = [
    "success",
    "onSuccess",
    "successContainer",
    "warning",
    "onWarning",
    "warningContainer",
    "card",
    "onCard",
    "popover",
    "onPopover",
    "control",
    "controlStrong",
  ];

  it("exposes the colours Material 3 has no role for: status, card, popover and control fills", () => {
    const light = colorBlock(color, "PatinaLightExtension");
    expect(Object.keys(light)).toEqual(KEYS);
    expect(Object.keys(colorBlock(color, "PatinaDarkExtension"))).toEqual(KEYS);
    expect(light).toMatchObject({ success: "016630", onSuccess: "FAFAFA", warning: "973C00", onWarning: "FAFAFA" });
    // Card and popover are white in light mode; the control fill is the 50% input colour over the background.
    expect(light).toMatchObject({ card: "FFFFFF", popover: "FFFFFF", onCard: "090B0C" });
  });

  it.each(["Light", "Dark"])("keeps %s status text and card text readable (4.5:1) on their surfaces", (theme) => {
    const block = colorBlock(color, `Patina${theme}Extension`);
    const hex = (name: string): Linear => {
      const value = block[name] ?? "";
      const channel = (offset: number) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
      const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return [linear(channel(0)), linear(channel(2)), linear(channel(4))];
    };
    expect(contrastRatio(hex("onCard"), hex("card"))).toBeGreaterThan(15);
    const low = [
      ["success", "successContainer"],
      ["warning", "warningContainer"],
      ["onCard", "card"],
      ["onPopover", "popover"],
    ].filter(([text, surface]) => contrastRatio(hex(text ?? ""), hex(surface ?? "")) < 4.5);
    expect(low).toEqual([]);
  });

  it("declares the package and the snapshot", () => {
    expect(color).toContain(`package ${ANDROID_PACKAGE}`);
    expect(color.split("\n")[0]).toContain(version);
  });
});

/** The CSS weights the type tokens use, and the Compose constants that stand for them. */
const WEIGHT_NAMES: Record<string, string> = { "400": "Normal", "500": "Medium", "600": "SemiBold", "700": "Bold" };

describe("Type.kt", () => {
  // The arguments of `slot = TextStyle(...)`, which the generator writes one per line, joined back with commas.
  const textStyleArgs = (slot: string): string | undefined =>
    new RegExp(`^\\s+${slot} = TextStyle\\(\\n((?:\\s+\\w+ = .*,?\\n)+)\\s+\\),?$`, "m")
      .exec(type)?.[1]
      ?.trim()
      .split(/,\n\s+/)
      .join(", ")
      .replace(/,$/, "");

  // The M3 type table in Android.md: `| \`titleSmall\`, \`labelLarge\` | \`label\` | 14 / 20 sp | 500 |`.
  const rows = androidMd
    .split("\n")
    .map((line) =>
      /^\| ((?:`\w+`(?:, )?)+) \| `([\w-]+)` \| ([\d.]+) \/ ([\d.]+) sp \| (\d+)(?:, [−-]([\d.]+)em)? \|$/.exec(line),
    )
    .filter((match) => match !== null);

  it("finds the table rows", () => {
    expect(rows.length).toBe(9);
  });

  it("uses the size, line height, weight and tracking of Android.md for every mapped slot", () => {
    for (const row of rows) {
      const [, slots = "", , size = "", line = "", weight = "", tracking] = row;
      const expectedTracking = tracking === undefined ? "0.sp" : `(${-(Number(tracking) * Number(size))}).sp`;
      const expected = `fontFamily = ui, fontWeight = FontWeight.${WEIGHT_NAMES[weight]}, fontSize = ${size}.sp, lineHeight = ${line}.sp, letterSpacing = ${expectedTracking}`;
      const generated = (slots.match(/\w+/g) ?? []).map((slot) => ({
        slot,
        style: textStyleArgs(slot),
      }));
      expect(generated.map(({ slot }) => ({ slot, style: expected }))).toEqual(
        generated.map(({ slot, style }) => ({ slot, style })),
      );
    }
  });

  it("names every weight and keeps number literals out, so detekt's MagicNumber stays quiet", () => {
    expect(type).not.toMatch(/FontWeight\(\d/);
    expect(type).toContain('@file:Suppress("MagicNumber", "LongMethod")');
  });

  it("leaves display and headlineLarge at Material defaults with the UI family and no tracking", () => {
    for (const slot of ["displayLarge", "displayMedium", "displaySmall", "headlineLarge"]) {
      expect(type).toContain(`${slot} = base.${slot}.copy(fontFamily = ui, letterSpacing = 0.sp),`);
    }
  });

  it("provides code styles from the mono tokens", () => {
    expect(textStyleArgs("mono")).toContain("fontSize = 13.sp, lineHeight = 20.sp");
    expect(textStyleArgs("monoSmall")).toContain("fontSize = 12.sp, lineHeight = 16.sp");
    for (const line of type.split("\n")) expect(line.length).toBeLessThanOrEqual(120);
    expect(type).toContain("fun patinaCodeStyles(mono: FontFamily)");
  });
});

describe("Shape.kt", () => {
  it("equals the Shapes block of Android.md", () => {
    const slots = (source: string) =>
      Object.fromEntries(
        [...source.matchAll(/^\s+(\w+) = RoundedCornerShape\((\d+)\.dp\),?/gm)].map((match) => [match[1], match[2]]),
      );
    expect(slots(shape)).toEqual({ extraSmall: "4", small: "8", medium: "12", large: "16", extraLarge: "16" });
    expect(slots(shape)).toEqual(slots(androidMd));
  });
});
