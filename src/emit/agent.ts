// Agent-facing documentation served next to the registry: `llms.txt` (an index in the llmstxt.org format),
// `llms-full.txt` (everything in one file), the consumer guide with generated component and token tables, an
// AGENTS.md snippet and plain-markdown copies of the design guide and the component notes. Pure: the sources
// (docs/*.md, design-system/**) are read by the build and passed in.

import type { ComponentSpec } from "../components";
import type { ScalarGroup, TokenSet } from "../tokens";
import { REGISTRY_HOMEPAGE } from "./registry";

export interface AgentDocs {
  /** docs/agent-guide.md: the hand-written part of the guide. */
  guide: string;
  /** docs/agents-snippet.md: a block to paste into a consuming project's AGENTS.md. */
  snippet: string;
  /** design-system/README.md: the visual language. */
  design: string;
  /** design-system/Android.md: the Material 3 mapping. */
  android: string;
  /** design-system/tokens.json as written. */
  tokensJson: string;
  /** design-system/components/<Name>/README.md, by component name (`button`, `dropdown-menu`). */
  components: Record<string, string>;
}

/** Name of a component's notes file: `dropdown-menu` is `components/dropdown-menu.md`. */
export const componentDocPath = (name: string): string => `components/${name}.md`;

const url = (path: string): string => `${REGISTRY_HOMEPAGE}/${path}`;
const oneLine = (text: string): string => text.replace(/\s+/g, " ").trim();

function scalarLines(group: ScalarGroup, theme: "light" | "dark" = "light"): string {
  return group.tokens.map((token) => `- \`${token.name}\`: ${token.values[theme]}. ${oneLine(token.usage)}`).join("\n");
}

/** The tables that depend on the code and the tokens rather than on prose. */
export function generatedGuideSections(set: TokenSet, specs: readonly ComponentSpec[], version: string): string {
  const components = specs
    .map((spec) => {
      const lines = [
        `### ${spec.title}`,
        "",
        spec.description,
        "",
        "```bash",
        `npx shadcn@latest add @patina/${spec.name}`,
        "```",
      ];
      const patina = spec.registryDependencies.filter((dep) => dep.startsWith("@patina/"));
      if (patina.length > 0) lines.push("", `Also installs: ${patina.map((dep) => `\`${dep}\``).join(", ")}.`);
      lines.push("", `Design notes: [${componentDocPath(spec.name)}](${url(componentDocPath(spec.name))}).`);
      return lines.join("\n");
    })
    .join("\n\n");

  const colours = [
    "| Token | Use |",
    "|---|---|",
    ...set.colors.map((token) => `| \`${token.name}\` | ${oneLine(token.usage).replace(/\|/g, "\\|")} |`),
  ].join("\n");

  const text = set.type.groups
    .map((group) => {
      const rows = group.styles.map(
        (style) =>
          `- \`${style.name}\`: ${style.fontSize}/${style.lineHeight}, weight ${style.fontWeight}${style.usage ? `. ${oneLine(style.usage)}` : ""}`,
      );
      return `**${group.name}** (family \`${group.family}\`)\n\n${rows.join("\n")}`;
    })
    .join("\n\n");

  return [
    "## Components",
    "",
    "Every component is a registry item in the `@patina` namespace. Add one by name; its dependencies come with it.",
    "",
    components,
    "",
    "## Colour tokens",
    "",
    "Use these names (in Tailwind: `bg-<name>`, `text-<name>`, `border-<name>`; in Slint: `Theme.current.<name>`). Light and dark values differ; the names do not.",
    "",
    colours,
    "",
    "## Spacing, radius, size and shadow tokens",
    "",
    "**Spacing** (4px steps, equal to the Tailwind scale)",
    "",
    scalarLines(set.spacing),
    "",
    "**Radius**",
    "",
    scalarLines(set.radius),
    "",
    "**Size** (control, row and icon sizes)",
    "",
    scalarLines(set.size),
    "",
    "**Shadow** (light values; use `shadow-(--shadow-card)` and the like)",
    "",
    scalarLines(set.shadow),
    "",
    "## Text styles",
    "",
    text,
    "",
    `Token snapshot: ${version}.`,
    "",
  ].join("\n");
}

export function guideMd(set: TokenSet, specs: readonly ComponentSpec[], version: string, docs: AgentDocs): string {
  return `${docs.guide.trimEnd()}\n\n${generatedGuideSections(set, specs, version)}`;
}

export function llmsTxt(specs: readonly ComponentSpec[], version: string): string {
  const components = specs.map(
    (spec) => `- [${spec.title}](${url(componentDocPath(spec.name))}): ${oneLine(spec.description)}`,
  );
  return [
    "# Patina",
    "",
    "> A design system with one set of tokens for three platforms: a shadcn registry (Base UI, Tailwind 4) for the web, a Slint token file for desktop apps and static Material 3 theme files for Android. Emerald on a calm blue-gray neutral. Colour is used only by semantic token name.",
    "",
    "Read the guide first. It lists the rules that always apply (no colour literals, no computed state colours, one primary action per view) and how to install and use the components on each platform. Everything is a static file; the registry items are JSON files that the shadcn CLI installs.",
    "",
    "## Guides",
    "",
    `- [Guide for agents](${url("guide.md")}): rules, setup for web, Slint and Android, the component list, and every token name`,
    `- [Design guide](${url("design.md")}): the visual language: colour, type, density, radius, states, motion, icons, accessibility and UI copy rules`,
    `- [Android mapping](${url("android.md")}): how the tokens become Material 3 roles, typography and shapes`,
    `- [AGENTS.md snippet](${url("agents-snippet.md")}): a short block to paste into a project that uses Patina`,
    `- [Everything in one file](${url("llms-full.txt")}): the guide, the design guide, the Android mapping and every component note`,
    "",
    "## Components",
    "",
    ...components,
    "",
    "## Registry and token files",
    "",
    `- [Registry index](${url("r/registry.json")}): every item; install one with \`shadcn add @patina/<name>\``,
    `- [Base item](${url("r/base.json")}): \`shadcn init\` uses this to write the tokens, fonts and icon library into a project`,
    `- [Design tokens](${url("tokens/tokens.json")}): the single source of truth as JSON`,
    `- [Slint library archive](${url("slint/patina-slint.tar.gz")}): the tokens and the compact desktop components in one file; unpacks to \`patina/\``,
    `- [Slint entry file](${url("slint/patina.slint")}): \`import { Theme, Button } from "@patina"\` once this file is registered as the \`patina\` library`,
    `- [Slint tokens](${url("slint/tokens.slint")}): the \`Theme\` and \`Typography\` globals`,
    `- [Android library archive](${url("android/patina-android.tar.gz")}): the Compose theme, tokens, icons and the Patina components in one file; unpacks to \`patina/\``,
    `- [Android theme](${url("android/PatinaTheme.kt")}): \`PatinaTheme\`, the static Material 3 theme wrapper`,
    `- [Android Color.kt](${url("android/Color.kt")}): the light and dark Material 3 colour schemes and the extra colours (status, card, popover, control)`,
    `- [Android Type.kt](${url("android/Type.kt")}): the Material 3 typography and the code text styles`,
    `- [Android Shape.kt](${url("android/Shape.kt")}): the Material 3 shapes`,
    `- [Android Size.kt](${url("android/Size.kt")}): spacing and size constants`,
    `- [Android Icons.kt](${url("android/Icons.kt")}): the Phosphor icons the components draw`,
    `- [Font stylesheet](${url("fonts/patina-fonts.css")}): \`@font-face\` rules for the D2Coding and MaruBuri files served under /fonts/`,
    "",
    "## Licence",
    "",
    `- [LICENSE](${url("LICENSE")}): MIT, for the code and documentation`,
    `- [Third-party notices](${url("THIRD_PARTY_NOTICES.md")}): shadcn/ui and Phosphor Icons (MIT) and the fonts (SIL OFL 1.1, not covered by the MIT licence)`,
    "",
    `Token snapshot: ${version}.`,
    "",
  ].join("\n");
}

export function llmsFullTxt(set: TokenSet, specs: readonly ComponentSpec[], version: string, docs: AgentDocs): string {
  const notes = specs
    .filter((spec) => docs.components[spec.name] !== undefined)
    .map((spec) => (docs.components[spec.name] ?? "").trim())
    .join("\n\n");
  return [
    "<!-- Patina, all documentation in one file. Index: " + url("llms.txt") + " -->",
    "",
    guideMd(set, specs, version, docs).trim(),
    "",
    "---",
    "",
    "# Design guide",
    "",
    docs.design.trim(),
    "",
    "---",
    "",
    "# Android mapping",
    "",
    docs.android.trim(),
    "",
    "---",
    "",
    "# Component design notes",
    "",
    notes,
    "",
  ].join("\n");
}

/** The files this module adds below public/. */
export function agentFiles(
  set: TokenSet,
  specs: readonly ComponentSpec[],
  version: string,
  docs: AgentDocs,
): Record<string, string> {
  const files: Record<string, string> = {
    "llms.txt": llmsTxt(specs, version),
    "llms-full.txt": llmsFullTxt(set, specs, version, docs),
    "guide.md": guideMd(set, specs, version, docs),
    "agents-snippet.md": docs.snippet.endsWith("\n") ? docs.snippet : `${docs.snippet}\n`,
    "design.md": docs.design,
    "android.md": docs.android,
    "tokens/tokens.json": docs.tokensJson,
  };
  for (const spec of specs) {
    const note = docs.components[spec.name];
    if (note !== undefined) files[componentDocPath(spec.name)] = note;
  }
  return files;
}
