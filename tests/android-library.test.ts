import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ANDROID_ICONS, iconsKt, kotlinName, sizeKt } from "../src/emit/android";
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

describe("Icons.kt", () => {
  const icons = iconsKt(loadPhosphorIcons(root), version);

  it("draws every listed Phosphor icon from its single path", () => {
    for (const name of ANDROID_ICONS) expect(icons).toContain(`icon("${name}", "M`);
    expect(icons.match(/val \w+: ImageVector by lazy/g)).toHaveLength(ANDROID_ICONS.length);
  });

  it("rejects an icon that has more than one path", () => {
    const svgs = { ...loadPhosphorIcons(root), x: '<svg><path d="M1,1"/><path d="M2,2"/></svg>' };
    expect(() => iconsKt(svgs, version)).toThrow(/expected exactly one/);
  });
});

describe("the library sources", () => {
  it("export the tier 1 components and the theme", () => {
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
      ]),
    );
    expect(library["android/PatinaTheme.kt"]).toContain("fun PatinaTheme(");
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
    const missing = ["PatinaButton", "PatinaCard", "PatinaFilterChip", "PatinaAlertDialog"].filter((name) => {
      const text = files.find(([, source]) => source.includes(`fun ${name}(`))?.[1] ?? "";
      return !/MaterialTheme\.shapes\./.test(text);
    });
    expect(missing).toEqual([]);
  });
});
