import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { agentDocs, componentFolder } from "../src/agent-docs.ts";
import { COMPONENTS, loadComponents } from "../src/components.ts";
import { componentDocPath } from "../src/emit/agent.ts";
import { loadAndroidLibrary, loadPhosphorIcons } from "../src/android-lib.ts";
import { loadSlintLibrary } from "../src/slint-lib.ts";
import { REGISTRY_HOMEPAGE } from "../src/emit/registry.ts";
import { generate } from "../src/generate.ts";
import { parseTokens } from "../src/tokens.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();
const library = loadSlintLibrary(root);
const files = generate(
  set,
  version,
  loadComponents(root, version).items,
  { specs: COMPONENTS, docs: agentDocs(root) },
  library,
  { library: loadAndroidLibrary(root), icons: loadPhosphorIcons(root) },
);

/** Markdown links `[text](url)` in a text. */
const links = (text: string): { text: string; url: string }[] =>
  [...text.matchAll(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g)].map((match) => ({
    text: match[1] ?? "",
    url: match[2] ?? "",
  }));

/** Public files that the build writes outside generate(): the fonts and their licences. */
const fontPaths = [
  "fonts/patina-fonts.css",
  "slint/patina-slint.tar.gz",
  "android/patina-android.tar.gz",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
];

describe("componentFolder", () => {
  it("turns a registry name into the design-system folder", () => {
    expect(componentFolder("button")).toBe("Button");
    expect(componentFolder("dropdown-menu")).toBe("DropdownMenu");
    expect(componentFolder("toggle-group")).toBe("ToggleGroup");
  });
});

describe("llms.txt", () => {
  const text = files["llms.txt"] ?? "";

  it("follows the llmstxt.org layout: an H1, a blockquote summary, then H2 sections of link lists", () => {
    const lines = text.split("\n");
    expect(lines[0]).toBe("# Patina");
    expect(lines[2]).toMatch(/^> .{40,}/);
    const sections = lines.filter((line) => line.startsWith("## "));
    expect(sections).toEqual(["## Guides", "## Components", "## Registry and token files", "## Licence"]);
    // After the intro, every bullet is a link with a description.
    const bullets = lines.filter((line) => line.startsWith("- "));
    expect(bullets.length).toBeGreaterThan(20);
    for (const bullet of bullets) expect(bullet).toMatch(/^- \[[^\]]+\]\(https:\/\/[^)]+\)(: .+)?$/);
  });

  it("links only to files that the build serves", () => {
    const served = new Set([...Object.keys(files), ...fontPaths]);
    const broken = links(text)
      .filter(
        (link) =>
          !link.url.startsWith(`${REGISTRY_HOMEPAGE}/`) || !served.has(link.url.slice(REGISTRY_HOMEPAGE.length + 1)),
      )
      .map((link) => link.url);
    expect(broken).toEqual([]);
  });

  it("lists every component with its notes file", () => {
    const missing = COMPONENTS.filter(
      (spec) =>
        !text.includes(`${REGISTRY_HOMEPAGE}/${componentDocPath(spec.name)}`) ||
        files[componentDocPath(spec.name)] === undefined,
    ).map((spec) => spec.name);
    expect(missing).toEqual([]);
  });

  it("stamps the token snapshot", () => {
    expect(text).toContain(`Token snapshot: ${version}.`);
  });
});

describe("guide.md", () => {
  const guide = files["guide.md"] ?? "";

  it("starts with the hand-written guide and appends the generated tables", () => {
    expect(guide.startsWith(read("docs/agent-guide.md").trimEnd())).toBe(true);
    for (const heading of [
      "## Components",
      "## Colour tokens",
      "## Spacing, radius, size and shadow tokens",
      "## Text styles",
    ]) {
      expect(guide).toContain(heading);
    }
  });

  it("names every colour token and every component with its install command", () => {
    for (const token of set.colors) expect(guide).toContain(`| \`${token.name}\` |`);
    for (const spec of COMPONENTS) expect(guide).toContain(`npx shadcn@latest add @patina/${spec.name}\n`);
  });

  it("says which components an item installs with it", () => {
    expect(guide).toContain("Also installs: `@patina/button`.");
    expect(guide).toContain("Also installs: `@patina/toggle`.");
  });

  it("gives the commands the install test proves", () => {
    expect(guide).toContain(`npx shadcn@latest init ${REGISTRY_HOMEPAGE}/r/base.json`);
    expect(guide).toContain(`"@patina": "${REGISTRY_HOMEPAGE}/r/{name}.json"`);
    expect(guide).toMatch(/answer \*\*no\*\*/);
  });

  it("does not mention a private host, a local path or the design artifact", () => {
    for (const text of [
      guide,
      files["agents-snippet.md"] ?? "",
      files["llms.txt"] ?? "",
      files["llms-full.txt"] ?? "",
    ]) {
      expect(text).not.toMatch(/claude\.ai|git\.ptcookie|\/Users\/|\.local\.md|sandbox/i);
    }
  });
});

describe("the Slint part of the guide", () => {
  const guide = files["guide.md"] ?? "";
  const exported = [...(library["slint/patina.slint"] ?? "").matchAll(/export \{([^}]*)\} from "components\//g)]
    .flatMap((match) => (match[1] ?? "").split(","))
    .map((name) => name.trim())
    .filter((name) => name !== "" && !name.endsWith("Variant"));

  it("names every component that the library exports", () => {
    expect(exported.length).toBeGreaterThan(5);
    expect(exported.filter((name) => !new RegExp(`\\b${name}\\b`).test(guide))).toEqual([]);
  });

  it("gives the archive URL and the library path setup", () => {
    expect(guide).toContain(`${REGISTRY_HOMEPAGE}/slint/patina-slint.tar.gz`);
    expect(guide).toContain("with_library_paths");
    expect(guide).toContain('from "@patina"');
  });
});

describe("the Android part of the guide", () => {
  const guide = files["guide.md"] ?? "";
  const composables = Object.entries(loadAndroidLibrary(root))
    .flatMap(([, text]) => [...text.matchAll(/^@Composable\s+fun (Patina\w+)\(/gm)].map((match) => match[1] ?? ""))
    .filter(Boolean);

  it("names every component that the library exports", () => {
    expect(composables.length).toBeGreaterThan(8);
    expect(composables.filter((name) => !new RegExp(`\\b${name}\\b`).test(guide))).toEqual([]);
  });

  it("gives the archive URL and forbids dynamic colour", () => {
    expect(guide).toContain(`${REGISTRY_HOMEPAGE}/android/patina-android.tar.gz`);
    expect(guide).toMatch(/never use `dynamicLightColorScheme`/);
  });
});

describe("llms-full.txt", () => {
  const text = files["llms-full.txt"] ?? "";

  it("holds the guide, the design guide, the Android mapping and every component note", () => {
    expect(text).toContain("# Using Patina (guide for AI agents)");
    expect(text).toContain("# Design guide");
    expect(text).toContain("Android apps use this system through a **static Material 3 theme");
    const missing = COMPONENTS.filter((spec) => {
      const note = (files[componentDocPath(spec.name)] ?? "").trim();
      return note.length < 50 || !text.includes(note);
    }).map((spec) => spec.name);
    expect(missing).toEqual([]);
  });
});

describe("agents-snippet.md", () => {
  const snippet = files["agents-snippet.md"] ?? "";

  it("is short and points at the full documentation", () => {
    expect(snippet.split("\n").length).toBeLessThan(20);
    expect(snippet).toContain(`${REGISTRY_HOMEPAGE}/llms-full.txt`);
    expect(snippet.endsWith("\n")).toBe(true);
  });

  it("repeats the rules that matter most", () => {
    expect(snippet).toMatch(/semantic token name/);
    expect(snippet).toMatch(/@patina\/<name>/);
    expect(snippet).toMatch(/never pass `--overwrite`/);
  });
});

describe("served copies", () => {
  it("are the sources, unchanged", () => {
    expect(files["design.md"]).toBe(read("design-system/README.md"));
    expect(files["android.md"]).toBe(read("design-system/Android.md"));
    expect(files["tokens/tokens.json"]).toBe(read("design-system/tokens.json"));
  });

  it("do not tell a project to initialise from the shadcn preset", () => {
    expect(files["design.md"]).not.toMatch(/initialise with the shadcn preset/);
  });
});
