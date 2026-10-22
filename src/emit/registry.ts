// shadcn registry output: the `registry:base` item that initialises a project, and the registry index.
// Schema: https://ui.shadcn.com/schema/registry-item.json. The fields used here (extends, config, dependencies,
// cssVars with theme/light/dark, css with @import and @layer keys, meta) are documented.
// Not documented, so deliberately left out: @font-face and @custom-variant entries in `css`.

import type { TokenSet } from "../tokens";
import { registryCssVars } from "./css";

export const REGISTRY_HOMEPAGE = "https://patina.ptcookie.net";

/** Packages the base item pulls in. Fontsource variable packages self-host Inter, JetBrains Mono and Newsreader. */
export const BASE_DEPENDENCIES = [
  "@base-ui/react",
  "@fontsource-variable/inter",
  "@fontsource-variable/jetbrains-mono",
  "@fontsource-variable/newsreader",
  "@phosphor-icons/react",
  "class-variance-authority",
  "cn",
  "pretendard",
  "tw-animate-css",
] as const;

/** Imports come first, as the shadcn docs advise. Italic faces are separate Fontsource files. */
export const FONT_IMPORTS = [
  "@fontsource-variable/inter",
  "@fontsource-variable/inter/wght-italic.css",
  "@fontsource-variable/jetbrains-mono",
  "@fontsource-variable/jetbrains-mono/wght-italic.css",
  "@fontsource-variable/newsreader",
  "@fontsource-variable/newsreader/wght-italic.css",
  "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css",
] as const;

export interface RegistryItem {
  $schema: string;
  name: string;
  type: string;
  [key: string]: unknown;
}

export function baseItem(set: TokenSet, version: string): RegistryItem {
  const css: Record<string, unknown> = { '@import "tw-animate-css"': {} };
  for (const path of FONT_IMPORTS) css[`@import "${path}"`] = {};
  css["@layer base"] = {
    "*": { "@apply border-border": {} },
    body: { "@apply bg-background text-foreground font-sans antialiased": {} },
  };

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "base",
    type: "registry:base",
    title: "Patina base",
    description:
      "Patina design tokens for shadcn/ui: emerald on a calm blue-gray neutral, a tight radius scale, Inter, JetBrains Mono and Pretendard.",
    extends: "none",
    config: {
      // Built-in names (`utils`, and any stock component a project adds) resolve under this style, so it has to
      // be a style that exists at ui.shadcn.com. `base-luma` is the Luma lineage on Base UI.
      style: "base-luma",
      iconLibrary: "phosphor",
      tailwind: { baseColor: "mist" },
    },
    dependencies: [...BASE_DEPENDENCIES],
    cssVars: registryCssVars(set),
    css,
    meta: { snapshot: version },
  };
}

export function registryIndex(items: RegistryItem[]): Record<string, unknown> {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "patina",
    homepage: REGISTRY_HOMEPAGE,
    items: items.map(({ name, type, title, description }) => ({ name, type, title, description })),
  };
}

export const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
