import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as slint from "slint-ui";
import { afterAll, describe, expect, it } from "vitest";
import { firstFamily, slintName, slintTokens } from "../src/emit/slint.ts";
import { parseTokens } from "../src/tokens.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();
const source = slintTokens(set, version);

describe("slint names", () => {
  it("rewrites dots and takes the first family of a stack", () => {
    expect(slintName("space-1.5")).toBe("space-1-5");
    expect(slintName("muted-foreground")).toBe("muted-foreground");
    expect(firstFamily('"Inter", "Pretendard", ui-sans-serif')).toBe("Inter");
    expect(firstFamily("ui-monospace, monospace")).toBe("ui-monospace");
  });
});

describe("tokens.slint", () => {
  it("has one struct field and one value per colour token and theme", () => {
    const struct = /export struct ThemeColors \{([^}]*)\}/.exec(source)?.[1] ?? "";
    expect(struct.match(/: color,/g)).toHaveLength(set.colors.length);
    for (const theme of ["light", "dark"]) {
      const literal = new RegExp(`${theme}-colors: \\{([^}]*)\\}`).exec(source)?.[1] ?? "";
      expect(literal.match(/: #[0-9A-F]{8},/g)).toHaveLength(set.colors.length);
    }
  });

  it("writes translucent colours with their alpha", () => {
    expect(source).toMatch(/overlay: #0000004D,/);
    expect(source).toMatch(/control: #[0-9A-F]{6}80,/);
  });

  it("uses no identifier with a dot", () => {
    expect(source).toContain("space-1-5: 6px;");
    expect(source).not.toMatch(/property <length> [a-z-]*\.[0-9]/);
  });

  it("turns tracking in em into px", () => {
    expect(source).toContain("letter-spacing: -0.6px,");
    expect(source).toContain("letter-spacing: -0.24px,");
  });

  it("names the font families of the stacks", () => {
    expect(source).toContain('font-sans: "Inter";');
    expect(source).toContain('font-mono-ko: "D2Coding";');
    expect(source).toContain("font-italic: true,");
  });

  it("states the snapshot it came from", () => {
    expect(source.split("\n")[0]).toContain(version);
  });
});

describe("the Slint compiler", () => {
  const dir = mkdtempSync(join(tmpdir(), "patina-slint-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const compile = (patina: string) => {
    writeFileSync(join(dir, "tokens.slint"), patina);
    writeFileSync(
      join(dir, "app.slint"),
      `import { Theme, Typography, ThemeMode } from "tokens.slint";
export component App inherits Window {
    in-out property <ThemeMode> mode <=> Theme.current-mode;
    background: Theme.current.background;
    width: Theme.control-md * 10;
    Text {
        text: "Patina";
        color: Theme.current.link;
        font-family: Typography.body.font-family;
        font-size: Typography.body.font-size;
        font-weight: Typography.body.font-weight;
        letter-spacing: Typography.heading-2xl.letter-spacing;
        x: Theme.space-1-5;
    }
    Rectangle {
        border-radius: Theme.radius;
        background: Theme.current.overlay;
        height: Theme.compact-row;
    }
}
`,
    );
    return slint.loadFile(join(dir, "app.slint"));
  };

  it("compiles the generated file and the globals can be used", () => {
    const ui = compile(source) as Record<string, unknown>;
    expect(typeof ui.App).toBe("function");
  });

  it("rejects a broken token file (negative control)", () => {
    expect(() => compile(source.replace("radius: 8px;", "radius: oops;"))).toThrow(/Could not compile/);
  });
});
