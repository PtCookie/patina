// Web output: the CSS variables and Tailwind theme entries of the shadcn registry:base item.
// Colours are used by semantic name only, so every colour token becomes a root variable (`--muted-foreground`)
// plus a Tailwind theme colour (`--color-muted-foreground: var(--muted-foreground)`), which makes `text-link` or
// `bg-primary-hover` real utilities.

import type { ColorValue, TokenSet } from "../tokens";

export interface RegistryCssVars {
  /** Tailwind theme entries (the CLI writes them into `@theme inline`). */
  theme: Record<string, string>;
  /** `:root` */
  light: Record<string, string>;
  /** `.dark` */
  dark: Record<string, string>;
}

/** The value as written in tokens.json; a reference becomes `var(--name)`. */
function cssValue(value: ColorValue): string {
  return value.kind === "ref" ? `var(--${value.name})` : value.source;
}

/**
 * Fontsource's variable packages and the `pretendard` npm package register `Inter Variable`, `JetBrains Mono
 * Variable`, `Newsreader Variable` and `Pretendard Variable`. D2Coding and MaruBuri keep their own names.
 */
const VARIABLE_FAMILIES = ["Inter", "JetBrains Mono", "Newsreader", "Pretendard"] as const;

export function webFontStack(stack: string): string {
  const names = VARIABLE_FAMILIES.join("|");
  return stack.replace(new RegExp(`"(${names})"`, "g"), '"$1 Variable"');
}

/** Spacing tokens are `space-N` = N * 4px, the Tailwind default scale, so they need no variables on the web. */
export function spacingMatchesTailwind(set: TokenSet): boolean {
  return set.spacing.tokens.every((token) => {
    const step = Number(token.name.replace(/^space-/, ""));
    return token.values.light === `${step * 4}px`;
  });
}

export function registryCssVars(set: TokenSet): RegistryCssVars {
  const theme: Record<string, string> = {};
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  for (const token of set.colors) {
    theme[`color-${token.name}`] = `var(--${token.name})`;
    light[token.name] = cssValue(token.values.light);
    // A token with one shared value is declared once in :root; `.dark` inherits it.
    if (token.themed) dark[token.name] = cssValue(token.values.dark);
  }

  for (const token of set.radius.tokens) {
    if (token.name === "radius") {
      // `--radius` is the shadcn root variable; Tailwind's `rounded-lg` follows it.
      light.radius = token.values.light;
      theme["radius-lg"] = "var(--radius)";
    } else {
      theme[token.name] = token.values.light;
    }
  }

  for (const token of set.size.tokens) light[token.name] = token.values.light;

  // Shadows differ per theme (the ring colour). They are root variables only, used as `shadow-(--shadow-card)`.
  for (const token of set.shadow.tokens) {
    light[token.name] = token.values.light;
    dark[token.name] = token.values.dark;
  }

  for (const [key, stack] of Object.entries(set.type.families)) theme[`font-${key}`] = webFontStack(stack);

  return { theme, light, dark };
}
