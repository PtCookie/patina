// Parser for design-system/tokens.json (grammar: AGENTS.md, "tokens.json grammar").
// It validates structure and value syntax and resolves `{refs}` per theme. It throws a TokenError that
// names the offending path, so a broken snapshot fails the build with a precise message.

import { parseOklch, type Oklch } from "./color.ts";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export type ColorValue =
  { kind: "oklch"; color: Oklch; source: string } | { kind: "ref"; name: string; source: string };

interface TokenBase {
  name: string;
  usage: string;
  /** False when the token has a single string value shared by both themes (e.g. `sidebar-ring`). */
  themed: boolean;
}

export interface ColorToken extends TokenBase {
  values: Record<Theme, ColorValue>;
}

/** Spacing, radius, size and shadow tokens: opaque strings, per theme only for shadows. */
export interface ScalarToken extends TokenBase {
  values: Record<Theme, string>;
}

export interface ScalarGroup {
  note: string;
  tokens: ScalarToken[];
}

export interface FontFile {
  family: string;
  file: string;
  weight: string;
  style: string;
}

export interface TextStyle {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  fontStyle?: string;
  family?: string;
  sample?: string;
  usage?: string;
}

export interface TextGroup {
  name: string;
  family: string;
  styles: TextStyle[];
}

export interface TokenSet {
  name: string;
  version: number;
  meta: Record<string, string>;
  themes: { id: Theme; name: string }[];
  colors: ColorToken[];
  colorIndex: ReadonlyMap<string, ColorToken>;
  type: {
    fonts: FontFile[];
    families: Record<string, string>;
    groups: TextGroup[];
  };
  spacing: ScalarGroup;
  radius: ScalarGroup;
  size: ScalarGroup;
  shadow: ScalarGroup;
}

export class TokenError extends Error {
  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "TokenError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function asObject(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new TokenError(path, "expected an object");
  return value;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new TokenError(path, "expected an array");
  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string") throw new TokenError(path, "expected a string");
  return value;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TokenError(path, "expected a number");
  return value;
}

function optionalString(object: Record<string, unknown>, key: string, path: string): string | undefined {
  return object[key] === undefined ? undefined : asString(object[key], `${path}.${key}`);
}

const TOKEN_NAME = /^[a-z0-9][a-z0-9.-]*$/;
const REF = /^\{([a-z0-9][a-z0-9.-]*)\}$/;

function tokenName(value: unknown, path: string): string {
  const name = asString(value, `${path}.name`);
  if (!TOKEN_NAME.test(name)) throw new TokenError(`${path}.name`, `invalid token name ${JSON.stringify(name)}`);
  return name;
}

/** A string shared by both themes, or `{ light, dark }`. */
function themedStrings(value: unknown, path: string): { themed: boolean; values: Record<Theme, string> } {
  if (typeof value === "string") return { themed: false, values: { light: value, dark: value } };
  const object = asObject(value, path);
  const extra = Object.keys(object).filter((key) => !(THEMES as readonly string[]).includes(key));
  if (extra.length > 0) throw new TokenError(path, `unknown theme key(s): ${extra.join(", ")}`);
  return {
    themed: true,
    values: { light: asString(object.light, `${path}.light`), dark: asString(object.dark, `${path}.dark`) },
  };
}

export function parseColorValue(source: string, path: string): ColorValue {
  if (source.startsWith("{")) {
    const match = REF.exec(source);
    if (!match?.[1]) throw new TokenError(path, `invalid reference ${JSON.stringify(source)}`);
    return { kind: "ref", name: match[1], source };
  }
  try {
    return { kind: "oklch", color: parseOklch(source), source };
  } catch (error) {
    throw new TokenError(path, error instanceof Error ? error.message : String(error));
  }
}

function parseColorToken(value: unknown, path: string): ColorToken {
  const object = asObject(value, path);
  const { themed, values } = themedStrings(object.value, `${path}.value`);
  return {
    name: tokenName(object.name, path),
    usage: asString(object.usage, `${path}.usage`),
    themed,
    values: {
      light: parseColorValue(values.light, `${path}.value.light`),
      dark: parseColorValue(values.dark, `${path}.value.dark`),
    },
  };
}

function parseScalarGroup(value: unknown, path: string): ScalarGroup {
  const object = asObject(value, path);
  const seen = new Set<string>();
  const tokens = asArray(object.tokens, `${path}.tokens`).map((entry, index): ScalarToken => {
    const entryPath = `${path}.tokens[${index}]`;
    const token = asObject(entry, entryPath);
    const name = tokenName(token.name, entryPath);
    if (seen.has(name)) throw new TokenError(entryPath, `duplicate token ${JSON.stringify(name)}`);
    seen.add(name);
    const { themed, values } = themedStrings(token.value, `${entryPath}.value`);
    return { name, usage: asString(token.usage, `${entryPath}.usage`), themed, values };
  });
  return { note: asString(object.note, `${path}.note`), tokens };
}

function parseTextStyle(value: unknown, path: string): TextStyle {
  const object = asObject(value, path);
  return {
    name: asString(object.name, `${path}.name`),
    fontSize: asString(object.fontSize, `${path}.fontSize`),
    lineHeight: asString(object.lineHeight, `${path}.lineHeight`),
    fontWeight: asNumber(object.fontWeight, `${path}.fontWeight`),
    letterSpacing: optionalString(object, "letterSpacing", path),
    fontStyle: optionalString(object, "fontStyle", path),
    family: optionalString(object, "family", path),
    sample: optionalString(object, "sample", path),
    usage: optionalString(object, "usage", path),
  };
}

function parseType(value: unknown, path: string): TokenSet["type"] {
  const object = asObject(value, path);
  const fonts = asArray(object.fonts, `${path}.fonts`).map((entry, index): FontFile => {
    const entryPath = `${path}.fonts[${index}]`;
    const font = asObject(entry, entryPath);
    return {
      family: asString(font.family, `${entryPath}.family`),
      file: asString(font.file, `${entryPath}.file`),
      weight: asString(font.weight, `${entryPath}.weight`),
      style: asString(font.style, `${entryPath}.style`),
    };
  });
  const families = Object.fromEntries(
    Object.entries(asObject(object.families, `${path}.families`)).map(([key, family]) => [
      key,
      asString(family, `${path}.families.${key}`),
    ]),
  );
  const groups = asArray(object.groups, `${path}.groups`).map((entry, index): TextGroup => {
    const entryPath = `${path}.groups[${index}]`;
    const group = asObject(entry, entryPath);
    const family = asString(group.family, `${entryPath}.family`);
    if (!(family in families)) throw new TokenError(`${entryPath}.family`, `unknown family ${JSON.stringify(family)}`);
    return {
      name: asString(group.name, `${entryPath}.name`),
      family,
      styles: asArray(group.styles, `${entryPath}.styles`).map((style, i) =>
        parseTextStyle(style, `${entryPath}.styles[${i}]`),
      ),
    };
  });
  return { fonts, families, groups };
}

/** Resolves a colour token to a concrete OKLCH colour for one theme, following `{refs}`. */
export function resolveColor(set: Pick<TokenSet, "colorIndex">, name: string, theme: Theme): Oklch {
  const trail: string[] = [];
  let current = name;
  for (;;) {
    if (trail.includes(current)) {
      throw new TokenError(`color.tokens.${name}`, `circular reference ${[...trail, current].join(" -> ")} (${theme})`);
    }
    trail.push(current);
    const token = set.colorIndex.get(current);
    if (!token) {
      throw new TokenError(`color.tokens.${name}`, `unresolved reference {${current}} (${theme})`);
    }
    const value = token.values[theme];
    if (value.kind === "oklch") return value.color;
    current = value.name;
  }
}

/** Parses and validates a tokens.json document. Throws TokenError on the first problem. */
export function parseTokens(input: unknown): TokenSet {
  const root = asObject(input, "$");
  const color = asObject(root.color, "color");

  const themes = asArray(color.themes, "color.themes").map((entry, index) => {
    const path = `color.themes[${index}]`;
    const theme = asObject(entry, path);
    const id = asString(theme.id, `${path}.id`);
    if (!(THEMES as readonly string[]).includes(id)) throw new TokenError(`${path}.id`, `unknown theme ${id}`);
    return { id: id as Theme, name: asString(theme.name, `${path}.name`) };
  });
  if (themes.map((theme) => theme.id).join() !== THEMES.join()) {
    throw new TokenError("color.themes", `expected themes ${THEMES.join(", ")}`);
  }

  const colors = asArray(color.tokens, "color.tokens").map((entry, index) =>
    parseColorToken(entry, `color.tokens[${index}]`),
  );
  const colorIndex = new Map<string, ColorToken>();
  for (const token of colors) {
    if (colorIndex.has(token.name)) {
      throw new TokenError("color.tokens", `duplicate token ${JSON.stringify(token.name)}`);
    }
    colorIndex.set(token.name, token);
  }

  const meta = Object.fromEntries(
    Object.entries(asObject(root.meta, "meta")).map(([key, value]) => [key, asString(value, `meta.${key}`)]),
  );

  const set: TokenSet = {
    name: asString(root.name, "name"),
    version: asNumber(root.version, "version"),
    meta,
    themes,
    colors,
    colorIndex,
    type: parseType(root.type, "type"),
    spacing: parseScalarGroup(root.spacing, "spacing"),
    radius: parseScalarGroup(root.radius, "radius"),
    size: parseScalarGroup(root.size, "size"),
    shadow: parseScalarGroup(root.shadow, "shadow"),
  };

  // Every reference must resolve, in both themes, without cycles.
  for (const token of colors) {
    for (const theme of THEMES) resolveColor(set, token.name, theme);
  }
  return set;
}
