import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { fontFaceCss } from "../src/emit/fontface";
import { fileFonts, loadFonts, PACKAGE_FAMILIES, parseSums } from "../src/fonts";
import { parseTokens } from "../src/tokens";

const repo = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, repo), "utf8");
const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();

describe("which fonts are served as files", () => {
  const fonts = fileFonts(set);

  it("is every family that no npm package delivers", () => {
    expect(fonts.map((font) => `${font.family} ${font.weight}`)).toEqual([
      "D2Coding 400",
      "D2Coding 700",
      "MaruBuri 400",
      "MaruBuri 600",
      "MaruBuri 700",
    ]);
    for (const family of PACKAGE_FAMILIES) expect(fonts.some((font) => font.family === family)).toBe(false);
  });
});

describe("parseSums", () => {
  it("reads shasum output, with or without the binary marker", () => {
    const hash = "a".repeat(64);
    expect([...parseSums(`${hash}  one.ttf\n${hash} *two.otf\nnot a line\n`)]).toEqual([
      ["one.ttf", hash],
      ["two.otf", hash],
    ]);
  });
});

describe("the committed font files", () => {
  const loaded = loadFonts(repo, set);

  it("are the pinned official files and have their licence texts", () => {
    expect(loaded.problems).toEqual([]);
    expect(Object.keys(loaded.assets).sort()).toEqual([
      "fonts/D2Coding-Bold.ttf",
      "fonts/D2Coding-OFL.txt",
      "fonts/D2Coding-Regular.ttf",
      "fonts/MaruBuri-Bold.otf",
      "fonts/MaruBuri-OFL.txt",
      "fonts/MaruBuri-Regular.otf",
      "fonts/MaruBuri-SemiBold.otf",
    ]);
  });

  it("keep the sizes of the official releases", () => {
    const size = (name: string) => loaded.assets[`fonts/${name}`]?.length;
    expect(size("D2Coding-Regular.ttf")).toBe(4119796);
    expect(size("D2Coding-Bold.ttf")).toBe(4343276);
    expect(size("MaruBuri-Regular.otf")).toBe(960344);
    expect(size("MaruBuri-SemiBold.otf")).toBe(1161108);
    expect(size("MaruBuri-Bold.otf")).toBe(1030424);
  });

  it("have no unlisted file next to them", () => {
    const files = readdirSync(new URL("fonts/", repo)).filter((name) => !name.startsWith("."));
    expect(files.sort()).toEqual(
      [
        "D2Coding-Bold.ttf",
        "D2Coding-Regular.ttf",
        "MaruBuri-Bold.otf",
        "MaruBuri-Regular.otf",
        "MaruBuri-SemiBold.otf",
        "SHA256SUMS",
      ].sort(),
    );
  });
});

describe("loadFonts detects fonts that are not the official files", () => {
  const dir = mkdtempSync(join(tmpdir(), "patina-fonts-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  /** A copy of the font inputs under `dir/<name>`, to be damaged by the test. */
  function copyInputs(name: string): URL {
    const root = join(dir, name);
    for (const folder of ["fonts", "design-system/assets/Licenses"]) {
      mkdirSync(join(root, folder), { recursive: true });
      // Regular files only: tools may leave marker directories (such as .claude) next to them.
      for (const entry of readdirSync(new URL(`${folder}/`, repo), { withFileTypes: true })) {
        if (entry.isFile()) copyFileSync(new URL(`${folder}/${entry.name}`, repo), join(root, folder, entry.name));
      }
    }
    return pathToFileURL(`${root}/`);
  }

  it("passes on an untouched copy", () => {
    expect(loadFonts(copyInputs("clean"), set).problems).toEqual([]);
  });

  it("reports a modified font (one changed byte)", () => {
    const root = copyInputs("modified");
    const path = new URL("fonts/MaruBuri-Regular.otf", root);
    const data = readFileSync(path);
    data[data.length - 1] = (data[data.length - 1] ?? 0) ^ 0xff;
    writeFileSync(path, data);
    const { problems } = loadFonts(root, set);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^fonts\/MaruBuri-Regular\.otf differs from the pinned official file/);
  });

  it("reports a missing font, a missing checksum entry and a stale one", () => {
    const missing = copyInputs("missing");
    rmSync(new URL("fonts/D2Coding-Bold.ttf", missing));
    expect(loadFonts(missing, set).problems).toContain("fonts/D2Coding-Bold.ttf is missing");

    const unlisted = copyInputs("unlisted");
    const sums = readFileSync(new URL("fonts/SHA256SUMS", unlisted), "utf8")
      .split("\n")
      .filter((line) => !line.includes("MaruBuri-Bold.otf"))
      .concat(`${"b".repeat(64)}  Gone.ttf`)
      .join("\n");
    writeFileSync(new URL("fonts/SHA256SUMS", unlisted), sums);
    const { problems } = loadFonts(unlisted, set);
    expect(problems).toContain("fonts/MaruBuri-Bold.otf has no entry in fonts/SHA256SUMS");
    expect(problems).toContain("fonts/SHA256SUMS lists Gone.ttf, which tokens.json does not use");
  });

  it("reports a missing checksum file and a missing licence text", () => {
    const noSums = copyInputs("no-sums");
    rmSync(new URL("fonts/SHA256SUMS", noSums));
    expect(loadFonts(noSums, set).problems).toContain("fonts/SHA256SUMS is missing");

    const noLicence = copyInputs("no-licence");
    rmSync(new URL("design-system/assets/Licenses/MaruBuri-OFL.txt", noLicence));
    expect(loadFonts(noLicence, set).problems).toContain("design-system/assets/Licenses/MaruBuri-OFL.txt is missing");
  });
});

describe("patina-fonts.css", () => {
  const css = fontFaceCss(set, version);
  const faces = [...css.matchAll(/@font-face \{([^}]*)\}/g)].map((match) => match[1] ?? "");

  it("has one @font-face per served file with its weight and format", () => {
    expect(faces).toHaveLength(5);
    const summary = faces.map((face) => ({
      family: /font-family: "([^"]+)"/.exec(face)?.[1],
      url: /url\("([^"]+)"\)/.exec(face)?.[1],
      format: /format\("([^"]+)"\)/.exec(face)?.[1],
      weight: /font-weight: (\d+)/.exec(face)?.[1],
    }));
    expect(summary).toEqual([
      { family: "D2Coding", url: "./D2Coding-Regular.ttf", format: "truetype", weight: "400" },
      { family: "D2Coding", url: "./D2Coding-Bold.ttf", format: "truetype", weight: "700" },
      { family: "MaruBuri", url: "./MaruBuri-Regular.otf", format: "opentype", weight: "400" },
      { family: "MaruBuri", url: "./MaruBuri-SemiBold.otf", format: "opentype", weight: "600" },
      { family: "MaruBuri", url: "./MaruBuri-Bold.otf", format: "opentype", weight: "700" },
    ]);
  });

  it("uses swap, relative urls and does not mention the npm-delivered families as faces", () => {
    expect(faces.every((face) => face.includes("font-display: swap;") && face.includes('url("./'))).toBe(true);
    expect(css).not.toMatch(/font-family: "(Inter|JetBrains Mono|Newsreader|Pretendard)"/);
    expect(css.split("\n")[0]).toContain(version);
  });

  it("names the font families the tokens' stacks refer to", () => {
    const stacks = Object.values(set.type.families).join(" ");
    for (const family of ["D2Coding", "MaruBuri"]) expect(stacks).toContain(`"${family}"`);
  });
});
