// Colour math shared by the checks and the generators. Port of tools/cc.py: the numbers must stay
// identical so web, Slint and Android agree (tests/fixtures/m3.json is generated from the Python
// reference).

/** Linear-light sRGB channels in [0, 1]. */
export type Linear = readonly [number, number, number];

export interface Oklch {
  l: number;
  c: number;
  h: number;
  /** 0 to 1. */
  alpha: number;
}

export const WHITE: Linear = [1, 1, 1];
export const BLACK: Linear = [0, 0, 0];

const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)%)?\s*\)$/;

function toNumber(text: string | undefined, source: string): number {
  const value = Number(text);
  if (text === undefined || !Number.isFinite(value)) {
    throw new Error(`Invalid number in oklch() value: ${JSON.stringify(source)}`);
  }
  return value;
}

/** Parses `oklch(L C H)` and `oklch(L C H / A%)`; the alpha percentage may be fractional (`4.5%`). */
export function parseOklch(source: string): Oklch {
  const match = OKLCH.exec(source.trim());
  if (!match) throw new Error(`Invalid oklch() value: ${JSON.stringify(source)}`);
  const percent = match[4] === undefined ? 100 : toNumber(match[4], source);
  if (percent > 100) throw new Error(`Alpha above 100% in oklch() value: ${JSON.stringify(source)}`);
  return {
    l: toNumber(match[1], source),
    c: toNumber(match[2], source),
    h: toNumber(match[3], source),
    alpha: percent / 100,
  };
}

/** `oklch(L C H)` or `oklch(L C H / A%)`, with up to 5 decimals and no trailing zeros. */
export function formatOklch({ l, c, h, alpha }: Oklch): string {
  const n = (x: number): string => String(+x.toFixed(5));
  return `oklch(${n(l)} ${n(c)} ${n(h)}${alpha < 1 ? ` / ${n(alpha * 100)}%` : ""})`;
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/**
 * OKLCH to linear sRGB. Out-of-gamut colours are clamped per channel in linear light, exactly like
 * tools/cc.py.
 */
export function oklchToLinear({ l, c, h }: Pick<Oklch, "l" | "c" | "h">): Linear {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const lc = l_ ** 3;
  const mc = m_ ** 3;
  const sc = s_ ** 3;
  return [
    clamp01(4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc),
    clamp01(-1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc),
    clamp01(-0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc),
  ];
}

/** WCAG relative luminance of a linear colour. */
export const luminance = (rgb: Linear): number => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];

/** Linear to sRGB-encoded (gamma) channel. */
export const encode = (x: number): number => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);

/** sRGB-encoded (gamma) to linear channel. */
export const decode = (x: number): number => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);

/** Composites `fg` at `alpha` over `bg`. Blending happens in gamma space, as browsers do. */
export function compositeOver(fg: Linear, alpha: number, bg: Linear): Linear {
  const mix = (f: number, b: number): number => decode(encode(f) * alpha + encode(b) * (1 - alpha));
  return [mix(fg[0], bg[0]), mix(fg[1], bg[1]), mix(fg[2], bg[2])];
}

/** Linear colour of `color`; a translucent colour is composited over `backdrop` (white by default). */
export function flatten(color: Oklch, backdrop: Linear = WHITE): Linear {
  const rgb = oklchToLinear(color);
  return color.alpha < 1 ? compositeOver(rgb, color.alpha, backdrop) : rgb;
}

/** WCAG contrast ratio of two opaque linear colours. */
export function contrastRatio(a: Linear, b: Linear): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Contrast of two `oklch()` strings; a translucent foreground is composited over the background. */
export function contrast(foreground: string, background: string): number {
  const fg = parseOklch(foreground);
  const bg = oklchToLinear(parseOklch(background));
  return contrastRatio(flatten(fg, bg), bg);
}

// Python's round() rounds halves to even; Math.round() rounds them up. Hex output must match
// the reference, so round the same way.
function roundHalfEven(x: number): number {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (diff < 0.5) return floor;
  if (diff > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}

/** `#RRGGBB` of a linear colour (uppercase unless asked otherwise). */
export function toHex(rgb: Linear, upper = true): string {
  const hex = rgb
    .map((x) =>
      roundHalfEven(encode(x) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
  return `#${upper ? hex.toUpperCase() : hex}`;
}

/**
 * `#RRGGBBAA` of an OKLCH colour, the form Slint takes. Channels round like `toHex`; alpha rounds half up
 * (30% is `4D`), the way browsers quantise it.
 */
export function toHex8(color: Oklch): string {
  const alpha = Math.round(color.alpha * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  return `${toHex(oklchToLinear(color))}${alpha}`;
}
