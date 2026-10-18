// The component previews in design-system/components: one folder per component with a README.md (the rules) and a
// preview.html (a body fragment that carries its card size in a leading `@dsCard` comment). Read at build time, in
// Node only, so the site, its sidebar and the preview pages always agree with the snapshot.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Astro runs from the site folder (or the repository root in tests); the build moves the code to dist/, so paths cannot
// come from import.meta.url.
const repo = existsSync(resolve(process.cwd(), "design-system")) ? process.cwd() : resolve(process.cwd(), "..");
const folder = `${resolve(repo, "design-system", "components")}/`;

export interface ComponentDoc {
  /** The folder name, `DropdownMenu`. */
  name: string;
  /** The URL segment, `dropdown-menu`. */
  slug: string;
  /** The sidebar group from the @dsCard comment; previews without one are brand pieces. */
  group: string;
  /** The height of the preview card in pixels. */
  height: number;
  /** A card that shows a whole page rather than a few controls. */
  page: boolean;
  hasReadme: boolean;
}

export const kebab = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** `DropdownMenu` becomes "Dropdown menu". */
export const label = (name: string): string => {
  const words = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return words.charAt(0) + words.slice(1).toLowerCase();
};

export function componentDocs(): ComponentDoc[] {
  return readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(`${folder}${entry.name}/preview.html`))
    .map((entry): ComponentDoc => {
      const preview = readFileSync(`${folder}${entry.name}/preview.html`, "utf8");
      const card = /<!--\s*@dsCard([^>]*?)-->/.exec(preview)?.[1] ?? "";
      return {
        name: entry.name,
        slug: kebab(entry.name),
        group: /group="([^"]+)"/.exec(card)?.[1] ?? "Brand",
        height: Number(/height=(\d+)/.exec(card)?.[1] ?? 300),
        page: /\bpage\b/.test(card),
        hasReadme: existsSync(`${folder}${entry.name}/README.md`),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Components by sidebar group, in a fixed order that follows how a screen is built. */
export function componentGroups(): [string, ComponentDoc[]][] {
  const order = ["Actions", "Forms", "Navigation", "Surfaces", "Status", "Data", "Long-form", "Desktop", "Brand"];
  const docs = componentDocs();
  return order
    .map((group): [string, ComponentDoc[]] => [group, docs.filter((doc) => doc.group === group)])
    .filter(([, items]) => items.length > 0);
}
