import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { previewCss, type RawTokens } from "../src/emit/previewcss";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const tokens = JSON.parse(read("design-system/tokens.json")) as RawTokens;
const css = previewCss(tokens);

describe("previewCss", () => {
  it("puts the light values on :root and the dark ones under [data-theme=dark]", () => {
    const [light, dark] = css.split("\n[data-theme=");
    expect(light).toContain("--background: oklch(");
    expect(dark).toContain("--background: oklch(");
    expect(light).toContain("--space-4: 16px;");
    expect(dark).not.toContain("--space-4");
  });

  it("escapes the dot of a step and keeps token references as var()", () => {
    expect(css).toContain("--space-1\\.5: 6px;");
    expect(css).toMatch(/--chart-\d: oklch\(/);
    expect(css).not.toMatch(/\{[a-z-]+\}/);
  });

  it("names the variable font families that the site loads", () => {
    expect(css).toContain('--font-sans: "Inter Variable", "Pretendard Variable"');
    expect(css).toContain('"JetBrains Mono Variable"');
  });

  it("defines every variable that the previews and bundle.css read", () => {
    const folder = "design-system/components/";
    const sources = [
      read(`${folder}bundle.css`),
      ...readdirSync(new URL(folder, root), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => read(`${folder}${entry.name}/preview.html`)),
    ].join("\n");
    const used = new Set([...sources.matchAll(/var\((--[a-z0-9\\.-]+)/g)].map((match) => match[1] ?? ""));
    const undefinedNames = [...used].filter((name) => name !== "" && !css.includes(`${name}:`));
    // Variables that a preview or the component stylesheet defines for itself are not tokens.
    const local = undefinedNames.filter((name) => !new RegExp(`${name.replace(/[\\.]/g, "\\$&")}\\s*:`).test(sources));
    expect(local).toEqual([]);
  });
});
