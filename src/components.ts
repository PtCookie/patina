// Registry items for the components in registry/ui. The TSX files are hand-maintained (they are the shipped
// code, not generated from the previews); this module wraps each one in a `registry:ui` item with its
// dependencies. An item is named like the shadcn component it replaces, so `shadcn add @patina/button` writes
// to the same file as the stock `button` would.

import { existsSync, readFileSync } from "node:fs";
import type { RegistryItem } from "./emit/registry";

export interface ComponentSpec {
  name: string;
  title: string;
  description: string;
  /** Source path from the repo root. */
  file: string;
  /** npm packages the source imports, except react. */
  dependencies: string[];
  /** shadcn items the source relies on (`utils` provides `cn`). */
  registryDependencies: string[];
}

export const COMPONENTS: readonly ComponentSpec[] = [
  {
    name: "button",
    title: "Button",
    description:
      "Button with the Patina variants (default, outline, secondary, ghost, destructive, link), sizes and an opt-in pill shape.",
    file: "registry/ui/button.tsx",
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["utils"],
  },
  {
    name: "badge",
    title: "Badge",
    description: "Pill badge for status and metadata, with tinted success, warning, info and destructive variants.",
    file: "registry/ui/badge.tsx",
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["utils"],
  },
  {
    name: "input",
    title: "Input",
    description: "Borderless text field on the control fill, with an invalid ring and an opt-in pill shape.",
    file: "registry/ui/input.tsx",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "card",
    title: "Card",
    description:
      "Card surface with a ring shadow, a small size, an interactive variant and header, content and footer parts.",
    file: "registry/ui/card.tsx",
    dependencies: [],
    registryDependencies: ["utils"],
  },
  {
    name: "label",
    title: "Label",
    description: "The visible name of a form control: 14px medium at line-height 1, dimmed with a disabled control.",
    file: "registry/ui/label.tsx",
    dependencies: [],
    registryDependencies: ["utils"],
  },
  {
    name: "separator",
    title: "Separator",
    description: "A 1px border hairline, horizontal or vertical.",
    file: "registry/ui/separator.tsx",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "skeleton",
    title: "Skeleton",
    description: "A muted placeholder that pulses and stays still under reduced motion; text, block and circle shapes.",
    file: "registry/ui/skeleton.tsx",
    dependencies: ["class-variance-authority"],
    registryDependencies: ["utils"],
  },
  {
    name: "table",
    title: "Table",
    description:
      "Hairline-ruled data table with a scroll container class, numeric and mono columns, hover and selected rows.",
    file: "registry/ui/table.tsx",
    dependencies: [],
    registryDependencies: ["utils"],
  },
  {
    name: "checkbox",
    title: "Checkbox",
    description: "16px checkbox on the control-strong fill that turns primary with a Phosphor check when on.",
    file: "registry/ui/checkbox.tsx",
    dependencies: ["@base-ui/react", "@phosphor-icons/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "toggle",
    title: "Toggle",
    description: "Two-state button with default and outline variants and three sizes.",
    file: "registry/ui/toggle.tsx",
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["utils"],
  },
  {
    name: "toggle-group",
    title: "Toggle group",
    description: "Joined outline toggles for one choice, or several, out of a short set.",
    file: "registry/ui/toggle-group.tsx",
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["utils", "@patina/toggle"],
  },
  {
    name: "collapsible",
    title: "Collapsible",
    description: "Shows or hides content under a header row; the trigger icon turns 180 degrees when open.",
    file: "registry/ui/collapsible.tsx",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "pagination",
    title: "Pagination",
    description: "Page links: ghost 36px squares, the current page outlined, previous and next with carets.",
    file: "registry/ui/pagination.tsx",
    dependencies: ["@phosphor-icons/react", "class-variance-authority"],
    registryDependencies: ["utils"],
  },
  {
    name: "popover",
    title: "Popover",
    description: "A floating popover surface anchored to its trigger, with a header, title and description.",
    file: "registry/ui/popover.tsx",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "dropdown-menu",
    title: "Dropdown menu",
    description:
      "Solid menu with full-width rows, group labels, shortcuts, a destructive row and check and radio items.",
    file: "registry/ui/dropdown-menu.tsx",
    dependencies: ["@base-ui/react", "@phosphor-icons/react", "class-variance-authority"],
    registryDependencies: ["utils"],
  },
  {
    name: "sheet",
    title: "Sheet",
    description: "A panel that slides in from a screen edge over a dimmed, blurred overlay.",
    file: "registry/ui/sheet.tsx",
    dependencies: ["@base-ui/react", "@phosphor-icons/react"],
    registryDependencies: ["utils", "@patina/button"],
  },
  {
    name: "navigation-menu",
    title: "Navigation menu",
    description: "Top navigation: ghost items in a row with optional panels of titled links.",
    file: "registry/ui/navigation-menu.tsx",
    dependencies: ["@base-ui/react", "@phosphor-icons/react", "class-variance-authority"],
    registryDependencies: ["utils"],
  },
  {
    name: "chart",
    title: "Chart",
    description:
      "Recharts charts on the sequential teal ramp: border grid and axes, muted tabular ticks and a popover tooltip.",
    file: "registry/ui/chart.tsx",
    // The same recharts release the stock shadcn chart pins.
    dependencies: ["recharts@3.8.0"],
    registryDependencies: ["utils"],
  },
  {
    name: "kbd",
    title: "Kbd",
    description: "A keyboard key chip on the kbd tint, with a group wrapper; flips to page colours inside a tooltip.",
    file: "registry/ui/kbd.tsx",
    dependencies: [],
    registryDependencies: ["utils"],
  },
  {
    name: "switch",
    title: "Switch",
    description: "A 44x20 on/off switch on the control-strong track, filling primary when on.",
    file: "registry/ui/switch.tsx",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "alert",
    title: "Alert",
    description:
      "An inline message on the card surface, with tinted success, warning and info variants and a destructive one.",
    file: "registry/ui/alert.tsx",
    dependencies: ["class-variance-authority"],
    registryDependencies: ["utils"],
  },
  {
    name: "tooltip",
    title: "Tooltip",
    description: "A short inverted label that opens on hover or focus, with room for a Kbd.",
    file: "registry/ui/tooltip.tsx",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "tabs",
    title: "Tabs",
    description: "A pill segmented control: a muted track with a raised active tab, and panels.",
    file: "registry/ui/tabs.tsx",
    dependencies: ["@base-ui/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "select",
    title: "Select",
    description: "A control field that opens a solid list with a check on the selected row, with an opt-in pill shape.",
    file: "registry/ui/select.tsx",
    dependencies: ["@base-ui/react", "@phosphor-icons/react"],
    registryDependencies: ["utils"],
  },
  {
    name: "article",
    title: "Article",
    description:
      "Long-form reading text in the serif family at 17/28, styling plain headings, paragraphs, quotes and code.",
    file: "registry/ui/article.tsx",
    dependencies: [],
    registryDependencies: ["utils"],
  },
];

/** `recharts@3.8.0` is `recharts`, `@scope/pkg@1.2.3` is `@scope/pkg`; a bare name is unchanged. */
export const packageName = (dependency: string): string => dependency.replace(/(?<=.)@[^@/]+$/, "");

/** npm packages a source imports. `react` is a peer of every project, and `@/…` aliases are project files. */
export function importedPackages(source: string): string[] {
  const packages = new Set<string>();
  for (const match of source.matchAll(/^\s*import\b[^"']*["']([^"']+)["']/gm)) {
    const specifier = match[1] ?? "";
    if (specifier.startsWith(".") || specifier.startsWith("@/") || specifier === "react") continue;
    const parts = specifier.split("/");
    packages.add(specifier.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? specifier));
  }
  return [...packages].sort();
}

export interface LoadedComponents {
  items: RegistryItem[];
  problems: string[];
}

export function componentItem(spec: ComponentSpec, source: string, version: string): RegistryItem {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: spec.name,
    type: "registry:ui",
    title: spec.title,
    description: spec.description,
    dependencies: spec.dependencies,
    registryDependencies: spec.registryDependencies,
    files: [{ path: `ui/${spec.name}.tsx`, type: "registry:ui", content: source }],
    meta: { snapshot: version },
  };
}

/** Reads the component sources from `root` and checks each against its declared dependencies. */
export function loadComponents(root: URL, version: string): LoadedComponents {
  const items: RegistryItem[] = [];
  const problems: string[] = [];
  for (const spec of COMPONENTS) {
    const url = new URL(spec.file, root);
    if (!existsSync(url)) {
      problems.push(`${spec.file} is missing`);
      continue;
    }
    const source = readFileSync(url, "utf8");
    const imported = importedPackages(source);
    const declared = spec.dependencies.map(packageName).sort();
    if (imported.join() !== declared.join()) {
      problems.push(
        `${spec.file} imports [${imported.join(", ")}] but ${spec.name} declares dependencies [${declared.join(", ")}]`,
      );
    }
    items.push(componentItem(spec, source, version));
  }
  return { items, problems };
}
