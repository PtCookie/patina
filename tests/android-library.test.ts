import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ANDROID_ICONS, iconsKt, kotlinName, sizeKt, splitPath } from "../src/emit/android";
import { loadAndroidLibrary, loadPhosphorIcons } from "../src/android-lib";
import { parseTokens } from "../src/tokens";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();
const library = loadAndroidLibrary(root);
const files = Object.entries(library);

/** The composables the library exports: `fun PatinaButton(` and friends. */
const composables = files
  .flatMap(([, text]) => [...text.matchAll(/^@Composable\s+fun (Patina\w+)\(/gm)].map((match) => match[1] ?? ""))
  .filter(Boolean);

describe("kotlinName", () => {
  it("camel-cases token names and replaces the dot of a step", () => {
    expect(kotlinName("control-md")).toBe("controlMd");
    expect(kotlinName("space-1.5")).toBe("space1_5");
    expect(kotlinName("space-12")).toBe("space12");
    expect(kotlinName("compact-control")).toBe("compactControl");
  });
});

describe("Size.kt", () => {
  const size = sizeKt(set, version);

  it("has one Dp constant per spacing and size token", () => {
    for (const token of [...set.spacing.tokens, ...set.size.tokens]) {
      expect(size).toContain(`val ${kotlinName(token.name)} = ${Number.parseFloat(token.values.light)}.dp`);
    }
  });

  it("stamps the snapshot", () => {
    expect(size.split("\n")[0]).toContain(version);
  });
});

describe("PatinaIcons.kt", () => {
  const icons = iconsKt(loadPhosphorIcons(root), version);

  it("draws every listed Phosphor icon from its single path", () => {
    for (const name of ANDROID_ICONS) expect(icons).toMatch(new RegExp(`icon\\(\\s+"${name}",\\s+"M`));
    expect(icons.match(/val \w+: ImageVector by lazy/g)).toHaveLength(ANDROID_ICONS.length);
  });

  it("keeps every line within 120 characters", () => {
    for (const line of icons.split("\n")) expect(line.length).toBeLessThanOrEqual(120);
  });

  it("splits path data without losing a character", () => {
    const data = "M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72";
    const pieces = splitPath(data, 20);
    expect(pieces.join("")).toBe(data);
    expect(pieces.every((piece) => /^[A-Za-z]/.test(piece))).toBe(true);
    expect(pieces.length).toBeGreaterThan(1);
  });

  it("rejects an icon that has more than one path", () => {
    const svgs = { ...loadPhosphorIcons(root), x: '<svg><path d="M1,1"/><path d="M2,2"/></svg>' };
    expect(() => iconsKt(svgs, version)).toThrow(/expected exactly one/);
  });
});

describe("the library sources", () => {
  it("keep every line within 120 characters, since apps lint the files they vendor", () => {
    for (const [path, text] of files) {
      for (const [index, line] of text.split("\n").entries()) {
        expect(line.length, `${path}:${index + 1}`).toBeLessThanOrEqual(120);
      }
    }
  });

  it("export the tier 1 and tier 2 components and the theme", () => {
    expect(composables).toEqual(
      expect.arrayContaining([
        "PatinaButton",
        "PatinaCard",
        "PatinaTextField",
        "PatinaSwitch",
        "PatinaRadioButton",
        "PatinaFilterChip",
        "PatinaAlertDialog",
        "PatinaTopAppBar",
        "PatinaListItem",
        "PatinaBadge",
        "PatinaCheckbox",
        "PatinaTabs",
        "PatinaSelect",
        "PatinaDropdownMenu",
        "PatinaDropdownMenuItem",
        "PatinaDropdownMenuLabel",
        "PatinaDropdownMenuDivider",
        "PatinaAlert",
        "PatinaBottomSheet",
        "PatinaTooltip",
        "PatinaDivider",
        "PatinaSkeleton",
      ]),
    );
    expect(library["android/patina/theme/PatinaTheme.kt"]).toContain("fun PatinaTheme(");
  });

  it("never write a colour literal: colours come from the theme", () => {
    const offenders = files
      .filter(([, text]) => /\bColor\(0x|Color\.(?:Red|Green|Blue|Black|White|Gray|Yellow)\b|\.copy\(alpha/.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("take sizes and spacing from the tokens: no dp literal except zero and named constants", () => {
    const offenders = files.flatMap(([path, text]) =>
      text
        .split("\n")
        .filter((line) => /\b(?!0\.dp)\d+(?:\.\d+)?\.dp\b/.test(line))
        .filter(
          (line) => !/^\s*(?:private |internal )?(?:const )?val [A-Za-z_]+\s*=\s*\d+(?:\.\d+)?\.dp\s*$/.test(line),
        )
        .map((line) => `${path}: ${line.trim()}`),
    );
    expect(offenders).toEqual([]);
  });

  it("do not use Material You dynamic colour", () => {
    const offenders = files.filter(([, text]) => /dynamic(?:Light|Dark)ColorScheme/.test(text)).map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("set the shape and colours of a Material component instead of keeping its defaults", () => {
    // The Material defaults are pills and tonal fills; each wrapper has to pass its own shape.
    const missing = [
      "PatinaButton",
      "PatinaCard",
      "PatinaFilterChip",
      "PatinaAlertDialog",
      "PatinaCheckbox",
      "PatinaDropdownMenu",
      "PatinaSelect",
      "PatinaAlert",
      "PatinaBottomSheet",
    ].filter((name) => {
      const text = files.find(([, source]) => source.includes(`fun ${name}(`))?.[1] ?? "";
      return !/MaterialTheme\.shapes\./.test(text);
    });
    expect(missing).toEqual([]);
  });
});
