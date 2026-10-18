// Contrast baselines. The accessibility guarantees are written as prose in tokens.json `usage` strings and in
// design-system/README.md; this module turns each one into a requirement and measures it on the real colours
// (translucent colours are composited over their backdrop first). The prose is never trusted: tests compare it
// with the computed numbers.

import { contrastRatio, flatten, type Linear } from "./color";
import { resolveColor, THEMES, type Theme, type TokenSet } from "./tokens";

/** A background token. A translucent one (a `*-muted` tint) is composited over `over` (default `background`). */
export type Surface = string | { token: string; over: string };

type PerTheme = Record<Theme, number>;

export interface Requirement {
  /** `foreground on background`, or `foreground on tint (over card)`. */
  id: string;
  foreground: string;
  background: Surface;
  /** Minimum ratio per theme: the number the prose promises. */
  min: PerTheme;
  /** Ratios the prose prints exactly (rounded to one decimal), e.g. "5.1:1 light, 7.2:1 dark". */
  stated?: Partial<PerTheme>;
  source: string;
}

export interface Measurement {
  requirement: Requirement;
  theme: Theme;
  ratio: number;
}

export interface ContrastIssue {
  id: string;
  theme: Theme;
  message: string;
}

const both = (n: number): PerTheme => ({ light: n, dark: n });
const AA = both(4.5);
const FLOOR = "design-system/README.md § Accessibility: every text colour is at least 4.5:1 on its background";

const surfaceName = (surface: Surface): string =>
  typeof surface === "string" ? surface : `${surface.token} (over ${surface.over})`;

interface Rule {
  min: PerTheme;
  stated?: Partial<PerTheme>;
  source: string;
}

function on(foreground: string, backgrounds: Surface[], rule: Rule): Requirement[] {
  return backgrounds.map((background) => ({
    id: `${foreground} on ${surfaceName(background)}`,
    foreground,
    background,
    ...rule,
  }));
}

const tint = (token: string, over = "background"): Surface => ({ token, over });
const usage = (token: string): string => `tokens.json usage of \`${token}\``;

export const REQUIREMENTS: readonly Requirement[] = [
  // Text and icons on the main surfaces.
  ...on("foreground", ["background", "card", "popover", "muted", "accent", "sidebar"], {
    min: { light: 17, dark: 14 },
    source: usage("foreground"),
  }),
  ...on("card-foreground", ["card"], { min: AA, source: FLOOR }),
  ...on("popover-foreground", ["popover"], { min: AA, source: FLOOR }),
  ...on("accent-foreground", ["accent"], { min: AA, source: FLOOR }),
  ...on("sidebar-foreground", ["sidebar", "sidebar-accent"], { min: AA, source: FLOOR }),
  ...on("sidebar-accent-foreground", ["sidebar-accent"], { min: AA, source: FLOOR }),

  // Text on fills.
  ...on("primary-foreground", ["primary"], {
    min: AA,
    stated: { light: 5.1, dark: 7.2 },
    source: usage("primary-foreground"),
  }),
  ...on("secondary-foreground", ["secondary"], {
    min: AA,
    stated: { light: 15.6, dark: 14.3 },
    source: usage("secondary-foreground"),
  }),
  ...on("sidebar-primary-foreground", ["sidebar-primary"], {
    min: AA,
    stated: { light: 5.1, dark: 6.1 },
    source: usage("sidebar-primary-foreground"),
  }),

  // Emerald text is `link`, not `primary`.
  ...on("link", ["background", "card", "muted"], { min: { light: 4.8, dark: 5.9 }, source: usage("link") }),
  ...on("muted-foreground", ["background", "card", "muted", "sidebar"], {
    min: { light: 4.7, dark: 6 },
    source: usage("muted-foreground"),
  }),
  ...on("tab-foreground", ["muted"], { min: AA, source: `${FLOOR}; the tabs track is \`muted\`` }),

  // Destructive text: 5.3:1 on the page, 4.8:1 on its own tint over the page, 4.5:1 on that tint over a card.
  ...on("destructive", ["background"], { min: both(5.3), source: usage("destructive") }),
  ...on("destructive", [tint("destructive-muted")], { min: both(4.8), source: usage("destructive") }),
  ...on("destructive", [tint("destructive-muted", "card")], { min: AA, source: usage("destructive") }),

  // Focus ring (non-text, 3:1). The usage note prints the ratios on `background` and `muted`.
  ...on("ring", ["background"], { min: both(3), stated: { light: 3.9, dark: 4.3 }, source: usage("ring") }),
  ...on("ring", ["muted"], { min: both(3), stated: { light: 3.5, dark: 3.2 }, source: usage("ring") }),
  ...on("ring", ["card"], { min: both(3), source: usage("ring") }),

  // Status colours: text on the page, the card and their own tint.
  ...on("success", ["background", "card", tint("success-muted"), tint("success-muted", "card")], {
    min: both(6),
    source: usage("success"),
  }),
  ...on("success-foreground", ["success"], {
    min: AA,
    stated: { light: 6.8, dark: 8.4 },
    source: usage("success-foreground"),
  }),
  ...on("warning", ["background", "card", tint("warning-muted"), tint("warning-muted", "card")], {
    min: both(6),
    source: usage("warning"),
  }),
  ...on("warning-foreground", ["warning"], { min: AA, source: FLOOR }),
  ...on("info", ["background", "card", tint("info-muted"), tint("info-muted", "card")], {
    min: both(5),
    source: usage("info"),
  }),
  ...on("info-foreground", ["info"], { min: AA, source: FLOOR }),
];

const toSurface = (set: TokenSet, surface: Surface, theme: Theme): Linear => {
  if (typeof surface === "string")
    return flatten(resolveColor(set, surface, theme), flatten(resolveColor(set, "background", theme)));
  const backdrop = flatten(resolveColor(set, surface.over, theme));
  return flatten(resolveColor(set, surface.token, theme), backdrop);
};

/** Contrast of one requirement in one theme, computed from the token values. */
export function measure(set: TokenSet, requirement: Requirement, theme: Theme): number {
  const background = toSurface(set, requirement.background, theme);
  const foreground = flatten(resolveColor(set, requirement.foreground, theme), background);
  return contrastRatio(foreground, background);
}

/** Every requirement in both themes. */
export function contrastReport(set: TokenSet): Measurement[] {
  return REQUIREMENTS.flatMap((requirement) =>
    THEMES.map((theme) => ({ requirement, theme, ratio: measure(set, requirement, theme) })),
  );
}

/** Requirements the snapshot fails. An empty result means every baseline holds. */
export function checkContrast(set: TokenSet): ContrastIssue[] {
  return contrastReport(set)
    .filter(({ requirement, theme, ratio }) => ratio < requirement.min[theme])
    .map(({ requirement, theme, ratio }) => ({
      id: requirement.id,
      theme,
      message: `${ratio.toFixed(2)}:1 is below ${requirement.min[theme]}:1 (${requirement.source})`,
    }));
}

/** Ratios the prose prints exactly that do not match the computed value at one decimal. */
export function statedMismatches(set: TokenSet): Measurement[] {
  return contrastReport(set).filter(({ requirement, theme, ratio }) => {
    const stated = requirement.stated?.[theme];
    return stated !== undefined && Number(ratio.toFixed(1)) !== stated;
  });
}
