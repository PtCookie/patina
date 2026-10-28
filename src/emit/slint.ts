// Slint output: public/slint/tokens.slint, next to the hand-written library in slint/. Colours are `#RRGGBBAA`; lengths keep their px values.
// The shadow tokens are CSS box-shadow lists, which Slint cannot express, so they are not emitted.

import { toHex8 } from "../color.ts";
import { resolveColor, THEMES, type ScalarToken, type TextStyle, type Theme, type TokenSet } from "../tokens.ts";

/** Slint identifiers use letters, digits and `-`/`_`: `space-1.5` becomes `space-1-5`. */
export const slintName = (name: string): string => name.replace(/\./g, "-");

/** The first family of a CSS font stack (`"Inter", "Pretendard", sans-serif` gives `Inter`). */
export function firstFamily(stack: string): string {
  const quoted = /^\s*"([^"]+)"/.exec(stack);
  return quoted?.[1] ?? stack.split(",")[0]?.trim() ?? stack;
}

const px = (value: number): string => `${+value.toFixed(3)}px`;

/** `-0.02em` at 30px is `-0.6px`; a style without tracking is `0px`. */
function letterSpacingPx(style: TextStyle): number {
  const em = /^(-?[\d.]+)em$/.exec(style.letterSpacing ?? "");
  return em?.[1] === undefined ? 0 : Number(em[1]) * Number.parseFloat(style.fontSize);
}

function colorLiteral(set: TokenSet, theme: Theme): string {
  const fields = set.colors.map(
    (token) => `        ${slintName(token.name)}: ${toHex8(resolveColor(set, token.name, theme))},`,
  );
  return `{\n${fields.join("\n")}\n    }`;
}

function lengths(tokens: ScalarToken[]): string[] {
  return tokens.map((token) => `    out property <length> ${slintName(token.name)}: ${token.values.light};`);
}

export function slintTokens(set: TokenSet, version: string): string {
  const colorFields = set.colors.map((token) => `    ${slintName(token.name)}: color,`);
  const families = Object.entries(set.type.families).map(
    ([key, stack]) => `    // ${key}: ${stack}\n    out property <string> font-${key}: "${firstFamily(stack)}";`,
  );

  const styles = set.type.groups.flatMap((group) =>
    group.styles.map((style) => {
      const family = firstFamily(set.type.families[style.family ?? group.family] ?? "");
      const lines = [
        `        font-family: "${family}",`,
        `        font-size: ${style.fontSize},`,
        `        line-height: ${style.lineHeight},`,
        `        font-weight: ${style.fontWeight},`,
        `        letter-spacing: ${px(letterSpacingPx(style))},`,
        `        font-italic: ${style.fontStyle === "italic"},`,
      ];
      return `    out property <TextStyle> ${slintName(style.name)}: {\n${lines.join("\n")}\n    };`;
    }),
  );

  return `// Generated from the Patina design tokens (snapshot ${version}). Do not edit by hand.
// Part of the Patina Slint library: vendor the whole slint/ folder and import from it: import { Theme, Typography } from "@patina";
// Shadow tokens are CSS box-shadow lists and are not part of this file.

export enum ThemeMode { light, dark }

export struct ThemeColors {
${colorFields.join("\n")}
}

export struct TextStyle {
    font-family: string,
    font-size: length,
    line-height: length,
    font-weight: int,
    letter-spacing: length,
    font-italic: bool,
}

export global Theme {
    // Set this to switch every \`Theme.current.<token>\` binding.
    in-out property <ThemeMode> current-mode: ThemeMode.light;

    out property <ThemeColors> light-colors: ${colorLiteral(set, THEMES[0])};
    out property <ThemeColors> dark-colors: ${colorLiteral(set, THEMES[1])};
    out property <ThemeColors> current: current-mode == ThemeMode.dark ? dark-colors : light-colors;

    // Spacing
${lengths(set.spacing.tokens).join("\n")}

    // Radius
${lengths(set.radius.tokens).join("\n")}

    // Sizes: comfortable (control-*, table-head, icon-*) and compact (compact-*)
${lengths(set.size.tokens).join("\n")}

    // First family of each stack; Slint has no font fallback list, so bundle the others with the app.
${families.join("\n")}
}

export global Typography {
${styles.join("\n")}
}
`;
}
