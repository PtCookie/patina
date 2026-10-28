// public/fonts/patina-fonts.css: @font-face rules for the font files served from /fonts/*.

import { fileFonts } from "../fonts.ts";
import type { TokenSet } from "../tokens.ts";

const FORMATS: Record<string, string> = { ttf: "truetype", otf: "opentype", woff2: "woff2", woff: "woff" };

export function fontFaceCss(set: TokenSet, version: string): string {
  const rules = fileFonts(set).map((font) => {
    const file = font.file.replace(/^fonts\//, "");
    const format = FORMATS[file.split(".").pop() ?? ""];
    if (!format) throw new Error(`Unknown font format for ${file}`);
    return `@font-face {
  font-family: "${font.family}";
  src: url("./${file}") format("${format}");
  font-weight: ${font.weight};
  font-style: ${font.style};
  font-display: swap;
}`;
  });

  return `/* Generated from the Patina design tokens (snapshot ${version}). Do not edit by hand.
 * Official, unmodified font files (SIL OFL 1.1); the licence texts are served next to them.
 * Serve this file from the same folder as the font files: the urls are relative.
 * Inter, JetBrains Mono, Newsreader and Pretendard come from npm packages and are not listed here. */

${rules.join("\n\n")}
`;
}
