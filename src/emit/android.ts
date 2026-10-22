// Android output: Color.kt, Type.kt and Shape.kt for a static Material 3 theme. The mapping rules are
// design-system/Android.md; the colour roles come from src/m3.ts.

import { compositeOver, flatten, oklchToLinear, toHex, type Linear } from "../color";
import { M3_ROLES, m3Scheme, type M3Role } from "../m3";
import { resolveColor, THEMES, type Theme, type TokenSet } from "../tokens";

/** Package of the generated files. Consumers vendor them and change this line to their own package. */
export const ANDROID_PACKAGE = "patina.theme";

const header = (version: string, file: string): string =>
  `// ${file}: generated from the Patina design tokens (snapshot ${version}). Do not edit by hand.\n`;

const argb = (rgb: Linear): string => `Color(0xFF${toHex(rgb).slice(1)})`;

const SCHEMES: Record<Theme, { name: string; factory: string }> = {
  light: { name: "PatinaLight", factory: "lightColorScheme" },
  dark: { name: "PatinaDark", factory: "darkColorScheme" },
};

/**
 * Tokens with no Material 3 role, exposed through `PatinaColors`. A `token` entry is the token as a solid colour
 * (translucent values are composited over the theme background); a `tint` entry is that share of the token over the
 * background, the same solid mix the Material containers use (12% light, 24% dark).
 */
const EXTENSION: readonly { property: string; token: string; tint?: { light: number; dark: number } }[] = [
  { property: "success", token: "success" },
  { property: "onSuccess", token: "success-foreground" },
  { property: "successContainer", token: "success", tint: { light: 0.12, dark: 0.24 } },
  { property: "warning", token: "warning" },
  { property: "onWarning", token: "warning-foreground" },
  { property: "warningContainer", token: "warning", tint: { light: 0.12, dark: 0.24 } },
  { property: "card", token: "card" },
  { property: "onCard", token: "card-foreground" },
  { property: "popover", token: "popover" },
  { property: "onPopover", token: "popover-foreground" },
  { property: "control", token: "control" },
  { property: "controlStrong", token: "control-strong" },
];

export function colorKt(set: TokenSet, version: string): string {
  const schemes = THEMES.map((theme) => {
    const scheme = m3Scheme(set, theme);
    const roles = M3_ROLES.map((role: M3Role) => `    ${role} = ${argb(scheme[role])},`);
    return `val ${SCHEMES[theme].name} = ${SCHEMES[theme].factory}(\n${roles.join("\n")}\n)`;
  });

  const extension = THEMES.map((theme) => {
    const background = flatten(resolveColor(set, "background", theme));
    const fields = EXTENSION.map(({ property, token, tint }) => {
      const value = tint
        ? compositeOver(oklchToLinear(resolveColor(set, token, theme)), tint[theme], background)
        : flatten(resolveColor(set, token, theme), background);
      return `    ${property} = ${argb(value)},`;
    });
    return `val ${SCHEMES[theme].name}Extension = PatinaColors(\n${fields.join("\n")}\n)`;
  });

  return `${header(version, "Color.kt")}package ${ANDROID_PACKAGE}

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

${schemes.join("\n")}

/**
 * Colours that Material 3 has no role for: status, card, popover and control fills.
 * Provide the set for the current theme.
 */
@Immutable
class PatinaColors(
${EXTENSION.map(({ property }) => `    val ${property}: Color,`).join("\n")}
)

${extension.join("\n")}

val LocalPatinaColors = staticCompositionLocalOf { ${SCHEMES.light.name}Extension }
`;
}

/** Material 3 styles that Android.md maps onto a system text style. */
const TYPE_MAP: readonly { m3: string[]; style: string }[] = [
  { m3: ["headlineMedium"], style: "heading-2xl" },
  { m3: ["headlineSmall"], style: "heading-xl" },
  { m3: ["titleLarge"], style: "heading-lg" },
  { m3: ["titleMedium"], style: "heading-md" },
  { m3: ["titleSmall", "labelLarge"], style: "label" },
  { m3: ["bodyLarge"], style: "body-lg" },
  { m3: ["bodyMedium"], style: "body" },
  { m3: ["bodySmall"], style: "caption-regular" },
  { m3: ["labelMedium", "labelSmall"], style: "caption" },
];

/** Left at Material defaults, with the UI family and zero tracking. */
const UNMAPPED = ["displayLarge", "displayMedium", "displaySmall", "headlineLarge"] as const;

const sp = (value: number): string => (value < 0 ? `(${value}).sp` : `${value}.sp`);

/** A `TextStyle(...)` call with one argument per line, so no generated line passes 120 characters. */
function textStyle(set: TokenSet, name: string, family: string, indent: number): string {
  const style = set.type.groups.flatMap((group) => group.styles).find((candidate) => candidate.name === name);
  if (!style) throw new Error(`Text style ${name} is missing from tokens.json`);
  const size = Number.parseFloat(style.fontSize);
  const em = /^(-?[\d.]+)em$/.exec(style.letterSpacing ?? "");
  const tracking = em?.[1] === undefined ? 0 : +(Number(em[1]) * size).toFixed(3);
  const args = [
    `fontFamily = ${family}`,
    `fontWeight = FontWeight(${style.fontWeight})`,
    `fontSize = ${sp(size)}`,
    `lineHeight = ${sp(Number.parseFloat(style.lineHeight))}`,
    `letterSpacing = ${tracking === 0 ? "0.sp" : sp(tracking)}`,
  ];
  const pad = " ".repeat(indent);
  return `TextStyle(\n${args.map((arg) => `${pad}    ${arg},`).join("\n")}\n${pad})`;
}

export function typeKt(set: TokenSet, version: string): string {
  const mapped = TYPE_MAP.flatMap(({ m3, style }) =>
    m3.map((slot) => `        ${slot} = ${textStyle(set, style, "ui", 8)},`),
  );
  const unmapped = UNMAPPED.map(
    (slot) => `        ${slot} = base.${slot}.copy(fontFamily = ui, letterSpacing = 0.sp),`,
  );

  return `${header(version, "Type.kt")}package ${ANDROID_PACKAGE}

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Compose cannot chain Inter and Pretendard the way CSS does, so the UI uses Pretendard alone.
 * [ui] is built from the official static OTFs (Regular, Medium, SemiBold, Bold).
 */
fun patinaTypography(ui: FontFamily): Typography {
    val base = Typography()
    return Typography(
${[...unmapped, ...mapped].join("\n")}
    )
}

/** Identifiers and code. Hangul inside JetBrains Mono falls back to the system font, so keep it to Latin text. */
class PatinaCodeStyles(
    val mono: TextStyle,
    val monoSmall: TextStyle,
)

fun patinaCodeStyles(mono: FontFamily): PatinaCodeStyles = PatinaCodeStyles(
    mono = ${textStyle(set, "mono", "mono", 4)},
    monoSmall = ${textStyle(set, "mono-sm", "mono", 4)},
)
`;
}

/** Material 3 shape slots and the radius token each one takes (Android.md, Shapes). */
const SHAPES: readonly { slot: string; token: string }[] = [
  { slot: "extraSmall", token: "radius-sm" },
  { slot: "small", token: "radius" },
  { slot: "medium", token: "radius-2xl" },
  { slot: "large", token: "radius-3xl" },
  { slot: "extraLarge", token: "radius-3xl" },
];

export function shapeKt(set: TokenSet, version: string): string {
  const radius = (name: string): string => {
    const token = set.radius.tokens.find((candidate) => candidate.name === name);
    if (!token) throw new Error(`Radius token ${name} is missing from tokens.json`);
    return `${Number.parseFloat(token.values.light)}.dp`;
  };
  const slots = SHAPES.map(({ slot, token }) => `    ${slot} = RoundedCornerShape(${radius(token)}), // ${token}`);

  return `${header(version, "Shape.kt")}package ${ANDROID_PACKAGE}

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/**
 * Material 3 components pick other slots than this system, so pass shapes explicitly: buttons and text fields
 * \`small\`, cards \`large\`, menus \`medium\`. The pill stays the opt-in \`CircleShape\`.
 */
val PatinaShapes = Shapes(
${slots.join("\n")}
)
`;
}

/** `control-md` becomes `controlMd`, `space-1.5` becomes `space1_5`. */
export const kotlinName = (name: string): string =>
  name.replace(/\./g, "_").replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase());

/** Spacing and size tokens as `Dp` constants. The compact sizes are for desktop; Android uses the comfortable ones. */
export function sizeKt(set: TokenSet, version: string): string {
  const entries = (group: typeof set.spacing) =>
    group.tokens.map((token) => `    val ${kotlinName(token.name)} = ${Number.parseFloat(token.values.light)}.dp`);
  return `${header(version, "Size.kt")}package ${ANDROID_PACKAGE}

import androidx.compose.ui.unit.dp

/** Spacing steps (4dp units). Padding and gaps come from here, never from literals. */
object PatinaSpace {
${entries(set.spacing).join("\n")}
}

/** Control, icon and row sizes. A control draws at its size but keeps a touch target of at least 48dp. */
object PatinaSize {
${entries(set.size).join("\n")}
}
`;
}

/** The Phosphor icons (regular weight) that the components draw, by file name in @phosphor-icons/core. */
export const ANDROID_ICONS = [
  "arrow-left",
  "caret-down",
  "check",
  "check-circle",
  "info",
  "warning",
  "x",
  "x-circle",
] as const;

/** Path data cut before a command letter into pieces of at most `max` characters, for a Kotlin string concatenation. */
export function splitPath(data: string, max: number): string[] {
  const segments = data.match(/[A-Za-z][^A-Za-z]*/g) ?? [data];
  const pieces: string[] = [];
  let current = "";
  for (const segment of segments) {
    if (current !== "" && current.length + segment.length > max) {
      pieces.push(current);
      current = "";
    }
    current += segment;
  }
  if (current !== "") pieces.push(current);
  return pieces;
}

/** `svgs` maps an icon name to its SVG source; each regular-weight icon is one `<path d="…">` in a 256 viewBox. */
export function iconsKt(svgs: Record<string, string>, version: string): string {
  const entries = ANDROID_ICONS.map((name) => {
    const paths = [...(svgs[name] ?? "").matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map((match) => match[1] ?? "");
    if (paths.length !== 1) throw new Error(`Phosphor icon ${name} has ${paths.length} paths; expected exactly one`);
    const data = splitPath(paths[0] ?? "", 90)
      .map((piece) => `"${piece}"`)
      .join(" +\n                ");
    const property = kotlinName(name).replace(/^./, (char) => char.toUpperCase());
    return `    val ${property}: ImageVector by lazy {\n        icon(\n            "${name}",\n            ${data},\n        )\n    }`;
  });
  return `${header(version, "Icons.kt")}package ${ANDROID_PACKAGE}

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.unit.dp

/**
 * Phosphor Icons (MIT, Copyright (c) 2020-2024 Phosphor Icons), regular weight, as vectors. The licence text is in
 * THIRD_PARTY_NOTICES.md; keep this notice when you copy the file.
 * They draw in black; Icon() tints them with the content colour.
 * The default size is 16dp ([PatinaSize.iconMd]): set \`Modifier.size\` to change it.
 */
object PatinaIcons {
${entries.join("\n\n")}

    private fun icon(name: String, pathData: String): ImageVector =
        ImageVector.Builder(
            name = name,
            defaultWidth = 16.dp,
            defaultHeight = 16.dp,
            viewportWidth = 256f,
            viewportHeight = 256f,
        )
            .addPath(pathData = PathParser().parsePathString(pathData).toNodes(), fill = SolidColor(Color.Black))
            .build()
}
`;
}
