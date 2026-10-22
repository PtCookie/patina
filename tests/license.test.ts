import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ANDROID_ICONS, iconsKt } from "../src/emit/android";
import { loadPhosphorIcons } from "../src/android-lib";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const license = read("LICENSE");
const notices = read("THIRD_PARTY_NOTICES.md");

describe("LICENSE", () => {
  it("is the plain MIT text for Minsup Ju, with nothing added that would confuse a licence detector", () => {
    expect(license.split("\n").slice(0, 3)).toEqual(["MIT License", "", "Copyright (c) 2026 Minsup Ju"]);
    expect(license).toContain('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND');
    // The standard MIT template has 21 lines; scope notes belong in THIRD_PARTY_NOTICES.md.
    expect(license.trimEnd().split("\n")).toHaveLength(21);
  });

  it("is what package.json declares", () => {
    const manifest = JSON.parse(read("package.json")) as { license?: string; author?: string | { name: string } };
    const author = typeof manifest.author === "string" ? manifest.author : manifest.author?.name;
    expect(manifest.license).toBe("MIT");
    expect(author).toBe("Minsup Ju");
  });
});

describe("THIRD_PARTY_NOTICES.md", () => {
  it("carries the full MIT notices of the projects that parts of the repository come from", () => {
    expect(notices).toContain("Copyright (c) 2023 shadcn");
    expect(notices).toContain("Copyright (c) 2020-2024 Phosphor Icons");
    expect(notices.match(/Permission is hereby granted, free of charge/g)).toHaveLength(2);
  });

  it("matches the Phosphor licence text kept with the design system", () => {
    // The upstream text uses CRLF line endings; compare the words, not the line breaks.
    const phosphor = read("design-system/assets/Licenses/Phosphor-MIT.txt").replace(/\r\n/g, "\n").trim();
    expect(notices).toContain(phosphor);
  });

  it("names the licence text of every font the repository ships", () => {
    const fonts = readdirSync(new URL("design-system/assets/Licenses/", root)).filter((name) =>
      name.endsWith("-OFL.txt"),
    );
    expect(fonts.length).toBeGreaterThan(5);
    expect(fonts.filter((name) => !notices.includes(name))).toEqual([]);
  });

  it("says the fonts are not under the MIT licence", () => {
    expect(notices).toMatch(/the fonts are not/);
    expect(notices).toMatch(/SIL Open Font License 1\.1/);
  });
});

describe("the notices that travel with generated files", () => {
  it("keeps the Phosphor copyright line in PatinaIcons.kt", () => {
    const icons = iconsKt(loadPhosphorIcons(root), "test");
    expect(icons).toContain("Copyright (c) 2020-2024 Phosphor Icons");
    expect(ANDROID_ICONS.length).toBeGreaterThan(0);
  });

  it("do not leave the licence undecided in the READMEs", () => {
    for (const name of ["README.md", "README.ko.md"]) {
      expect(read(name)).not.toMatch(/not decided yet|아직 정하지 않았습니다/);
      expect(read(name)).toContain("THIRD_PARTY_NOTICES.md");
    }
  });
});
