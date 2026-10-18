// Android Material 3 role mapping. Port of tools/m3.py; the mapping rules are documented in
// design-system/Android.md. Roles are computed in linear sRGB so the contrast checks and the
// generated hex values come from the same numbers.

import { BLACK, compositeOver, contrastRatio, flatten, oklchToLinear, parseOklch, toHex, type Linear } from "./color";
import { resolveColor, type Theme, type TokenSet } from "./tokens";

export const M3_ROLES = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "inversePrimary",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "background",
  "onBackground",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "surfaceTint",
  "inverseSurface",
  "inverseOnSurface",
  "outline",
  "outlineVariant",
  "scrim",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "surfaceDim",
  "surfaceBright",
] as const;

export type M3Role = (typeof M3_ROLES)[number];
export type M3Scheme = Record<M3Role, Linear>;

export interface M3Pair {
  foreground: M3Role;
  background: M3Role;
  /** WCAG minimum: 3:1 for `outline` (non-text), 4.5:1 for everything else. */
  min: number;
}

const textPair = (foreground: M3Role, background: M3Role): M3Pair => ({ foreground, background, min: 4.5 });

/** The text/fill pairs Android.md guarantees, in the order tools/m3.py prints them. */
export const M3_PAIRS: readonly M3Pair[] = [
  textPair("onPrimary", "primary"),
  textPair("onPrimaryContainer", "primaryContainer"),
  textPair("primary", "surface"),
  textPair("primary", "surfaceContainer"),
  textPair("onSecondaryContainer", "secondaryContainer"),
  textPair("onTertiary", "tertiary"),
  textPair("onTertiaryContainer", "tertiaryContainer"),
  textPair("onError", "error"),
  textPair("onErrorContainer", "errorContainer"),
  textPair("error", "surface"),
  textPair("onSurface", "surface"),
  textPair("onSurfaceVariant", "surfaceVariant"),
  textPair("onSurfaceVariant", "surfaceContainerHighest"),
  textPair("inverseOnSurface", "inverseSurface"),
  textPair("inversePrimary", "inverseSurface"),
  { foreground: "outline", background: "surface", min: 3 },
  { foreground: "outline", background: "surfaceContainerHighest", min: 3 },
];

// Container steps that exist in no web token; Android.md calls them "derived step".
const derived = (source: string): Linear => oklchToLinear(parseOklch(source));
const ERROR_ON_LIGHT = derived("oklch(0.985 0 0)");
const SURFACE_HIGH_LIGHT = derived("oklch(0.956 0.003 205)");
const SURFACE_HIGHEST_LIGHT = derived("oklch(0.948 0.004 212)");
const SURFACE_LOW_DARK = derived("oklch(0.183 0.006 226)");
const SURFACE_HIGH_DARK = derived("oklch(0.245 0.009 220)");

/** Builds the full M3 colour scheme for one theme from the tokens. */
export function m3Scheme(set: TokenSet, theme: Theme): M3Scheme {
  const light = theme === "light";
  const color = (name: string, target: Theme = theme) => resolveColor(set, name, target);
  const backdrop = color("background");

  /** Token as a solid colour: translucent values are composited over the theme background. */
  const solid = (name: string): Linear => flatten(color(name), flatten(backdrop));
  /** Token in another theme (or without a backdrop): translucent values go over white. */
  const plain = (name: string, target: Theme = theme): Linear => flatten(color(name, target));
  /** `pct` of the token's colour over the background, ignoring the token's own alpha. */
  const tint = (name: string, pct: number, target: Theme = theme): Linear =>
    compositeOver(oklchToLinear(color(name, target)), pct, plain("background"));

  const background = plain("background");
  const pct = light ? 0.12 : 0.24;

  return {
    primary: solid("link"),
    onPrimary: light ? solid("primary-foreground") : solid("sidebar-primary-foreground"),
    primaryContainer: light ? tint("primary", 0.12, "light") : solid("primary"),
    onPrimaryContainer: light ? plain("primary", "dark") : solid("primary-foreground"),
    inversePrimary: light ? plain("link", "dark") : plain("primary", "light"),
    secondary: solid("muted-foreground"),
    onSecondary: solid("background"),
    secondaryContainer: solid("secondary"),
    onSecondaryContainer: solid("secondary-foreground"),
    tertiary: solid("info"),
    onTertiary: solid("info-foreground"),
    tertiaryContainer: tint("info", pct),
    onTertiaryContainer: solid("info"),
    error: solid("destructive"),
    onError: light ? ERROR_ON_LIGHT : solid("background"),
    errorContainer: tint("destructive", pct),
    onErrorContainer: solid("destructive"),
    background,
    onBackground: solid("foreground"),
    surface: background,
    onSurface: solid("foreground"),
    surfaceVariant: solid("muted"),
    onSurfaceVariant: solid("muted-foreground"),
    surfaceTint: background,
    inverseSurface: solid("foreground"),
    inverseOnSurface: solid("background"),
    outline: solid("ring"),
    outlineVariant: solid("border"),
    scrim: BLACK,
    surfaceContainerLowest: background,
    surfaceContainerLow: light ? solid("sidebar") : SURFACE_LOW_DARK,
    surfaceContainer: light ? solid("muted") : solid("card"),
    surfaceContainerHigh: light ? SURFACE_HIGH_LIGHT : SURFACE_HIGH_DARK,
    surfaceContainerHighest: light ? SURFACE_HIGHEST_LIGHT : solid("muted"),
    surfaceDim: light ? solid("border") : background,
    surfaceBright: light ? background : solid("muted"),
  };
}

export interface M3PairResult extends M3Pair {
  ratio: number;
  ok: boolean;
}

export function m3Contrast(scheme: M3Scheme): M3PairResult[] {
  return M3_PAIRS.map((pair) => {
    const ratio = contrastRatio(scheme[pair.foreground], scheme[pair.background]);
    return { ...pair, ratio, ok: ratio >= pair.min };
  });
}

/** `#RRGGBB` for every role. */
export function m3Hex(scheme: M3Scheme): Record<M3Role, string> {
  return Object.fromEntries(M3_ROLES.map((role) => [role, toHex(scheme[role])])) as Record<M3Role, string>;
}
