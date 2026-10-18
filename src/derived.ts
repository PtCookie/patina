// Derived tokens: every state colour is a token whose value is a recipe over base tokens (AGENTS.md,
// "Derived tokens"). tokens.json stores the concrete result; this module recomputes it from the base
// tokens and reports every token that disagrees, so a changed base token cannot leave a stale derivative.

import { formatOklch, parseOklch, type Oklch } from "./color";
import { resolveColor, THEMES, type Theme, type TokenSet } from "./tokens";

export type Recipe =
  /** The base colour with its own alpha multiplied by `pct` percent. */
  | { kind: "alpha"; base: string; pct: number }
  /** `from` mixed `pct` percent toward `toward` in oklch along the shorter hue arc; opaque. */
  | { kind: "mix"; from: string; toward: string; pct: number }
  /** The token is stored as the reference `{name}`. */
  | { kind: "ref"; name: string }
  /** A fixed colour. */
  | { kind: "literal"; value: string }
  /** Any colour with alpha 0. */
  | { kind: "transparent" };

const alpha = (base: string, pct: number): Recipe => ({ kind: "alpha", base, pct });
const ref = (name: string): Recipe => ({ kind: "ref", name });
const same = (recipe: Recipe): Record<Theme, Recipe> => ({ light: recipe, dark: recipe });
const split = (light: Recipe, dark: Recipe): Record<Theme, Recipe> => ({ light, dark });

/** The recipe table from AGENTS.md. */
export const DERIVED: Readonly<Record<string, Record<Theme, Recipe>>> = {
  "primary-hover": same(alpha("primary", 80)),
  "secondary-hover": same({ kind: "mix", from: "secondary", toward: "foreground", pct: 5 }),
  "muted-hover": same(alpha("muted", 50)),
  "ghost-hover": split(ref("muted"), alpha("muted", 50)),
  "outline-hover": split(ref("muted"), alpha("input", 30)),
  "tab-active": split(ref("background"), alpha("input", 30)),
  "tab-foreground": same(alpha("foreground", 60)),
  control: same(alpha("input", 50)),
  "control-strong": same(alpha("input", 90)),
  kbd: same(alpha("muted-foreground", 10)),
  "destructive-muted": split(alpha("destructive", 10), alpha("destructive", 20)),
  "destructive-muted-hover": split(alpha("destructive", 20), alpha("destructive", 30)),
  "invalid-ring": split(alpha("destructive", 20), alpha("destructive", 40)),
  "invalid-border": split(alpha("destructive", 0), alpha("destructive", 50)),
  overlay: same({ kind: "literal", value: "oklch(0 0 0 / 30%)" }),
  "outline-fill": split(ref("background"), { kind: "transparent" }),
  "switch-thumb": split(ref("background"), ref("foreground")),
  "switch-thumb-checked": split(ref("background"), ref("primary-foreground")),
  "success-muted": split(alpha("success", 10), alpha("success", 20)),
  "warning-muted": split(alpha("warning", 10), alpha("warning", 20)),
  "info-muted": split(alpha("info", 10), alpha("info", 20)),
};

/** `shadow-card-hover` is `shadow-card` with the ring alpha doubled (5% to 10% light, 10% to 20% dark). */
export const SHADOW_CARD_HOVER = { token: "shadow-card-hover", base: "shadow-card", factor: 2 } as const;

export interface DerivedIssue {
  token: string;
  /** Null when the problem is not specific to one theme. */
  theme: Theme | null;
  message: string;
}

/**
 * CSS `color-mix(in oklch, from, toward pct%)` for two opaque colours: linear in L and C, hue along
 * the shorter arc. A colour with zero chroma has no hue, so the other colour's hue is used.
 */
export function mixOklch(from: Oklch, toward: Oklch, pct: number): Oklch {
  const t = pct / 100;
  let h: number;
  if (from.c === 0) h = toward.h;
  else if (toward.c === 0) h = from.h;
  else {
    const delta = ((((toward.h - from.h) % 360) + 540) % 360) - 180;
    h = (((from.h + delta * t) % 360) + 360) % 360;
  }
  return { l: from.l + (toward.l - from.l) * t, c: from.c + (toward.c - from.c) * t, h, alpha: 1 };
}

/** The colour a recipe produces for one theme. References resolve to the referenced colour. */
export function evaluateRecipe(set: Pick<TokenSet, "colorIndex">, recipe: Recipe, theme: Theme): Oklch {
  switch (recipe.kind) {
    case "alpha": {
      const base = resolveColor(set, recipe.base, theme);
      return { ...base, alpha: (base.alpha * recipe.pct) / 100 };
    }
    case "mix":
      return mixOklch(resolveColor(set, recipe.from, theme), resolveColor(set, recipe.toward, theme), recipe.pct);
    case "ref":
      return resolveColor(set, recipe.name, theme);
    case "literal":
      return parseOklch(recipe.value);
    case "transparent":
      return { l: 0, c: 0, h: 0, alpha: 0 };
  }
}

/**
 * tokens.json prints L, C and H with 3 decimals and drops trailing zeros (`0.53` is `0.530`), so the
 * printed digits cannot tell the precision. A value that prints more digits keeps them.
 */
const PLACES = 3;

function precision(source: string): [number, number, number] {
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(source);
  const places = (text: string | undefined): number => Math.max(PLACES, (text?.split(".")[1] ?? "").length);
  return [places(match?.[1]), places(match?.[2]), places(match?.[3])];
}

const hueDistance = (a: number, b: number): number => {
  const delta = Math.abs(a - b) % 360;
  return Math.min(delta, 360 - delta);
};

/**
 * Compares a recomputed colour with the stored one. tokens.json rounds L, C and H to 3 decimals, so
 * each of them may differ by half of the last digit; alpha must be exact.
 */
function mismatch(expected: Oklch, stored: Oklch, source: string): string | null {
  const [pl, pc, ph] = precision(source);
  const within = (a: number, b: number, places: number): boolean => Math.abs(a - b) <= 0.5 * 10 ** -places + 1e-9;
  const problems: string[] = [];
  if (!within(expected.l, stored.l, pl)) problems.push("L");
  if (!within(expected.c, stored.c, pc)) problems.push("C");
  const achromatic = expected.c === 0 && stored.c === 0;
  if (!achromatic && hueDistance(expected.h, stored.h) > 0.5 * 10 ** -ph + 1e-9) problems.push("H");
  if (Math.abs(expected.alpha - stored.alpha) * 100 > 1e-6) problems.push("alpha");
  return problems.length > 0 ? `${problems.join("/")} differ` : null;
}

function checkToken(set: TokenSet, name: string, theme: Theme, recipe: Recipe, issues: DerivedIssue[]): void {
  const token = set.colorIndex.get(name);
  if (!token) return; // reported once by checkDerived
  const value = token.values[theme];
  const report = (message: string): number => issues.push({ token: name, theme, message });

  let expected: Oklch;
  try {
    expected = evaluateRecipe(set, recipe, theme);
  } catch (error) {
    report(`cannot recompute: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  if (recipe.kind === "ref") {
    if (value.kind !== "ref" || value.name !== recipe.name) report(`expected {${recipe.name}}, found ${value.source}`);
    return;
  }
  if (recipe.kind === "transparent") {
    if (resolveColor(set, name, theme).alpha !== 0) report(`expected a transparent colour, found ${value.source}`);
    return;
  }
  if (value.kind !== "oklch") {
    report(`expected a concrete oklch value, found ${value.source}`);
    return;
  }
  const problem = mismatch(expected, value.color, value.source);
  if (problem) report(`${problem}: expected ${formatOklch(expected)}, found ${value.source}`);
}

const RING = /(\d+(?:\.\d+)?)%(\)\s*,)/;

/** Recomputes `shadow-card-hover` from `shadow-card` for one theme; null if it matches. */
export function expectedCardHover(cardShadow: string): string | null {
  // The ring is the first shadow layer: `0 0 0 1px oklch(... / 5%), ...`.
  const match = RING.exec(cardShadow);
  if (!match?.[1]) return null;
  const doubled = +(Number(match[1]) * SHADOW_CARD_HOVER.factor).toFixed(6);
  return cardShadow.replace(RING, `${doubled}%$2`);
}

function checkCardHover(set: TokenSet, issues: DerivedIssue[]): void {
  const find = (name: string) => set.shadow.tokens.find((token) => token.name === name);
  const base = find(SHADOW_CARD_HOVER.base);
  const hover = find(SHADOW_CARD_HOVER.token);
  if (!base || !hover) {
    issues.push({
      token: SHADOW_CARD_HOVER.token,
      theme: null,
      message: `needs shadow tokens ${SHADOW_CARD_HOVER.base} and ${SHADOW_CARD_HOVER.token}`,
    });
    return;
  }
  for (const theme of THEMES) {
    const expected = expectedCardHover(base.values[theme]);
    if (expected === null) {
      issues.push({ token: hover.name, theme, message: `no ring alpha found in ${base.name}` });
    } else if (expected !== hover.values[theme]) {
      issues.push({ token: hover.name, theme, message: `expected ${expected}, found ${hover.values[theme]}` });
    }
  }
}

/** Recomputes every derived token from its base tokens. An empty result means tokens.json is consistent. */
export function checkDerived(set: TokenSet): DerivedIssue[] {
  const issues: DerivedIssue[] = [];
  for (const [name, recipes] of Object.entries(DERIVED)) {
    if (!set.colorIndex.has(name)) {
      issues.push({ token: name, theme: null, message: "derived token is missing from tokens.json" });
      continue;
    }
    for (const theme of THEMES) checkToken(set, name, theme, recipes[theme], issues);
  }
  checkCardHover(set, issues);
  return issues;
}
