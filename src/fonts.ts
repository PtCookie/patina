// Font files served from /fonts/*. Pretendard, D2Coding and MaruBuri have Reserved Font Names, so the files in
// fonts/ must be the official ones, byte for byte: fonts/SHA256SUMS pins them and the build fails on any difference.
// Inter, JetBrains Mono, Newsreader and Pretendard come from npm packages and are not served from here.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import type { FontFile, TokenSet } from "./tokens.ts";

/** Families delivered by npm packages. Every other family in tokens.json is delivered as a file. */
export const PACKAGE_FAMILIES: readonly string[] = ["Inter", "JetBrains Mono", "Newsreader", "Pretendard"];

const basename = (file: string): string => file.replace(/^fonts\//, "");

/** The font files this repo serves, in token order. */
export function fileFonts(set: TokenSet): FontFile[] {
  return set.type.fonts.filter((font) => !PACKAGE_FAMILIES.includes(font.family));
}

/** Parses `shasum -a 256` output into file name -> hash. */
export function parseSums(text: string): Map<string, string> {
  const sums = new Map<string, string>();
  for (const line of text.split("\n")) {
    const match = /^([0-9a-f]{64}) [ *]?(.+)$/.exec(line.trim());
    if (match?.[1] && match[2]) sums.set(match[2], match[1]);
  }
  return sums;
}

export interface LoadedFonts {
  /** Path below public/ to file content: the font files and the licence text of each family. */
  assets: Record<string, Buffer>;
  problems: string[];
}

/** Reads the font files and licence texts from `root`, checking every font against fonts/SHA256SUMS. */
export function loadFonts(root: URL, set: TokenSet): LoadedFonts {
  const assets: Record<string, Buffer> = {};
  const problems: string[] = [];
  const read = (path: string): Buffer | undefined => {
    const url = new URL(path, root);
    return existsSync(url) ? readFileSync(url) : undefined;
  };

  const sumsText = read("fonts/SHA256SUMS");
  if (!sumsText) problems.push("fonts/SHA256SUMS is missing");
  const sums = parseSums(sumsText?.toString("utf8") ?? "");

  const used = new Set<string>();
  const families = new Set<string>();
  for (const font of fileFonts(set)) {
    const name = basename(font.file);
    used.add(name);
    families.add(font.family);
    const data = read(`fonts/${name}`);
    if (!data) {
      problems.push(`fonts/${name} is missing`);
      continue;
    }
    const expected = sums.get(name);
    const actual = createHash("sha256").update(data).digest("hex");
    if (expected === undefined) problems.push(`fonts/${name} has no entry in fonts/SHA256SUMS`);
    else if (expected !== actual) {
      problems.push(`fonts/${name} differs from the pinned official file (sha256 ${actual.slice(0, 12)}…)`);
    }
    assets[`fonts/${name}`] = data;
  }

  for (const name of sums.keys()) {
    if (!used.has(name)) problems.push(`fonts/SHA256SUMS lists ${name}, which tokens.json does not use`);
  }

  // OFL condition 2: the licence text travels with the fonts.
  for (const family of families) {
    const licence = read(`design-system/assets/Licenses/${family}-OFL.txt`);
    if (licence) assets[`fonts/${family}-OFL.txt`] = licence;
    else problems.push(`design-system/assets/Licenses/${family}-OFL.txt is missing`);
  }

  return { assets, problems };
}
