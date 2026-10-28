import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { toHex8, parseOklch } from "../src/color.ts";
import { registryCssVars, spacingMatchesTailwind, webFontStack } from "../src/emit/css.ts";
import { baseItem, BASE_DEPENDENCIES, json, registryIndex } from "../src/emit/registry.ts";
import { generate } from "../src/generate.ts";
import { parseTokens } from "../src/tokens.ts";
import { verifyTokens } from "../src/verify.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const snapshot: unknown = JSON.parse(read("design-system/tokens.json"));
const version = read("design-system/VERSION").trim();
const set = parseTokens(snapshot);

describe("toHex8", () => {
  it("writes #RRGGBBAA and rounds alpha half up", () => {
    expect(toHex8(parseOklch("oklch(0 0 0 / 30%)"))).toBe("#0000004D");
    expect(toHex8(parseOklch("oklch(1 0 0 / 15%)"))).toBe("#FFFFFF26");
    expect(toHex8(parseOklch("oklch(1 0 0)"))).toBe("#FFFFFFFF");
    expect(toHex8(parseOklch("oklch(1 0 0 / 0%)"))).toBe("#FFFFFF00");
  });
});

describe("verifyTokens", () => {
  it("passes on the committed snapshot", () => {
    expect(verifyTokens(set)).toEqual([]);
  });

  it("reports derived, contrast and Android problems of a broken snapshot", () => {
    const doc = structuredClone(snapshot) as { color: { tokens: { name: string; value: { light: string } }[] } };
    const muted = doc.color.tokens.find((token) => token.name === "muted-foreground");
    if (muted) muted.value.light = "oklch(0.7 0.021 213.5)";
    const problems = verifyTokens(parseTokens(doc));
    expect(problems.some((problem) => problem.startsWith("contrast muted-foreground on background (light)"))).toBe(
      true,
    );
    expect(problems.some((problem) => problem.startsWith("android onSurfaceVariant/surfaceVariant (light)"))).toBe(
      true,
    );
    expect(problems.some((problem) => problem.startsWith("derived kbd (light)"))).toBe(true);
  });
});

describe("registry CSS variables", () => {
  const vars = registryCssVars(set);

  it("maps every colour token to a root variable and a Tailwind colour", () => {
    for (const token of set.colors) {
      expect(vars.theme[`color-${token.name}`]).toBe(`var(--${token.name})`);
      expect(vars.light[token.name]).toBeDefined();
      expect(token.name in vars.dark).toBe(token.themed);
    }
  });

  it("keeps the token text and turns references into var()", () => {
    expect(vars.light.background).toBe("oklch(1 0 0)");
    expect(vars.dark.background).toBe("oklch(0.148 0.004 228.8)");
    expect(vars.light["ghost-hover"]).toBe("var(--muted)");
    expect(vars.dark["ghost-hover"]).toBe("oklch(0.275 0.011 216.9 / 50%)");
    expect(vars.dark["control-strong"]).toBe("oklch(1 0 0 / 13.5%)");
    expect(vars.light["sidebar-ring"]).toBe("var(--ring)");
  });

  it("declares a shared value once, in :root", () => {
    expect(vars.light["sidebar-ring"]).toBeDefined();
    expect("sidebar-ring" in vars.dark).toBe(false);
  });

  it("exposes the radius scale, sizes and shadows", () => {
    expect(vars.light.radius).toBe("8px");
    expect(vars.theme["radius-lg"]).toBe("var(--radius)");
    expect(vars.theme["radius-xl"]).toBe("10px");
    expect(vars.theme["radius-3xl"]).toBe("16px");
    expect(vars.theme["radius-full"]).toBe("9999px");
    expect("radius" in vars.theme).toBe(false);
    expect(vars.light["control-md"]).toBe("36px");
    expect(vars.light["compact-row"]).toBe("28px");
    expect(vars.light["shadow-card"]).not.toBe(vars.dark["shadow-card"]);
    expect(vars.dark["shadow-card-hover"]).toContain("/ 20%");
  });

  it("uses the registered variable-font names on the web only", () => {
    expect(vars.theme["font-sans"]).toBe(
      '"Inter Variable", "Pretendard Variable", ui-sans-serif, system-ui, sans-serif',
    );
    expect(vars.theme["font-heading"]).toBe(
      '"JetBrains Mono Variable", "Pretendard Variable", ui-monospace, monospace',
    );
    expect(vars.theme["font-serif"]).toContain('"Newsreader Variable", "MaruBuri"');
    expect(vars.theme["font-mono-ko"]).toBe('"D2Coding", ui-monospace, monospace');
    expect(webFontStack('"Inter", sans-serif')).toBe('"Inter Variable", sans-serif');
    expect(set.type.families.sans).toContain('"Inter",');
  });

  it("leaves spacing to Tailwind because the scale is the same", () => {
    expect(spacingMatchesTailwind(set)).toBe(true);
    expect(
      Object.keys({ ...vars.theme, ...vars.light, ...vars.dark }).filter((key) => key.startsWith("space")),
    ).toEqual([]);
  });

  it("has no key that needs CSS escaping", () => {
    const keys = [...Object.keys(vars.theme), ...Object.keys(vars.light), ...Object.keys(vars.dark)];
    expect(keys.filter((key) => /[^a-z0-9-]/.test(key))).toEqual([]);
  });
});

describe("registry items", () => {
  const base = baseItem(set, version);

  it("is a registry:base that starts from nothing", () => {
    expect(base).toMatchObject({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "base",
      type: "registry:base",
      extends: "none",
      config: { style: "base-luma", iconLibrary: "phosphor", tailwind: { baseColor: "mist" } },
      meta: { snapshot: version },
    });
  });

  it("declares the font packages it imports as dependencies", () => {
    const css = Object.keys(base.css as Record<string, unknown>);
    const imported = css
      .filter((key) => key.startsWith("@import "))
      .map((key) => /@import "([^"]+)"/.exec(key)?.[1] ?? "")
      .map((path) => (path.startsWith("@") ? path.split("/").slice(0, 2).join("/") : (path.split("/")[0] ?? "")));
    for (const pkg of imported) expect(BASE_DEPENDENCIES as readonly string[]).toContain(pkg);
  });

  it("puts every @import before the other css entries", () => {
    const keys = Object.keys(base.css as Record<string, unknown>);
    const lastImport = keys.map((key) => key.startsWith("@import ")).lastIndexOf(true);
    expect(keys.slice(0, lastImport + 1).every((key) => key.startsWith("@import "))).toBe(true);
    expect(keys).toContain("@layer base");
  });

  it("lists the base item in the registry index", () => {
    expect(registryIndex([base])).toMatchObject({
      name: "patina",
      homepage: "https://patina.ptcookie.net",
      items: [{ name: "base", type: "registry:base", title: "Patina base" }],
    });
  });

  it("serialises with two-space indent and a trailing newline", () => {
    expect(json({ a: 1 })).toBe('{\n  "a": 1\n}\n');
  });
});

describe("generate", () => {
  const files = generate(set, version);

  it("produces the planned URL space", () => {
    expect(Object.keys(files).sort()).toEqual([
      "android/patina/theme/Color.kt",
      "android/patina/theme/Shape.kt",
      "android/patina/theme/Size.kt",
      "android/patina/theme/Type.kt",
      "fonts/patina-fonts.css",
      "r/base.json",
      "r/registry.json",
      "slint/tokens.slint",
    ]);
  });

  it("is deterministic", () => {
    expect(generate(set, version)).toEqual(files);
  });

  it("stamps the snapshot version into every generated file", () => {
    // JSON has no comments: the registry item carries it in `meta.snapshot`; the index only lists items.
    const unstamped = Object.entries(files)
      .filter(([, content]) => !content.includes(version))
      .map(([path]) => path);
    expect(unstamped).toEqual(["r/registry.json"]);
  });

  it("emits valid JSON for the registry files", () => {
    expect(() => JSON.parse(files["r/base.json"] ?? "")).not.toThrow();
    expect(() => JSON.parse(files["r/registry.json"] ?? "")).not.toThrow();
  });
});
