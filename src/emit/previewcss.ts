// The custom properties that the component previews (design-system/components/*/preview.html and bundle.css) are
// written against: every token as `--name`, light values on `:root` and `[data-theme="light"]`, dark ones on
// `[data-theme="dark"]`. It is the TypeScript twin of tools/tokens_css.py, with the font stacks rewritten to the
// variable families that the site loads (`webFontStack`). Not part of the registry: the registry item carries the
// same tokens as shadcn `cssVars`.

import { webFontStack } from "./css.ts";

interface RawScalar {
  name: string;
  value: string;
}

interface RawColor {
  name: string;
  value: string | { light: string; dark: string };
}

/** The parts of tokens.json that this file reads. */
export interface RawTokens {
  color: { tokens: RawColor[] };
  spacing: { tokens: RawScalar[] };
  radius: { tokens: RawScalar[] };
  size: { tokens: RawScalar[] };
  shadow: { tokens: { name: string; value: { light: string; dark: string } }[] };
  type: { families: Record<string, string> };
}

const escapeName = (name: string): string => name.replace(/\./g, "\\.");
const resolveRefs = (value: string): string =>
  value.replace(/\{([a-z0-9.-]+)\}/g, (_, name: string) => `var(--${escapeName(name)})`);

export function previewCss(tokens: RawTokens): string {
  const common: string[] = [];
  const light: string[] = [];
  const dark: string[] = [];
  for (const token of tokens.color.tokens) {
    const name = `--${escapeName(token.name)}`;
    if (typeof token.value === "string") {
      common.push(`${name}: ${resolveRefs(token.value)};`);
    } else {
      light.push(`${name}: ${resolveRefs(token.value.light)};`);
      dark.push(`${name}: ${resolveRefs(token.value.dark)};`);
    }
  }
  for (const group of [tokens.spacing, tokens.radius, tokens.size]) {
    for (const token of group.tokens) common.push(`--${escapeName(token.name)}: ${token.value};`);
  }
  for (const token of tokens.shadow.tokens) {
    light.push(`--${escapeName(token.name)}: ${token.value.light};`);
    dark.push(`--${escapeName(token.name)}: ${token.value.dark};`);
  }
  for (const [key, stack] of Object.entries(tokens.type.families))
    common.push(`--font-${key}: ${webFontStack(stack)};`);
  return `:root,[data-theme="light"]{${[...common, ...light].join("")}}\n[data-theme="dark"]{${dark.join("")}}\n`;
}
