import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { COMPONENTS, importedPackages, loadComponents, packageName } from "../src/components";
import { baseItem } from "../src/emit/registry";
import { generate } from "../src/generate";
import { parseTokens } from "../src/tokens";

const repo = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, repo), "utf8");
const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();

/** Every component the registry ships, in registration order. Add a name here when you add a component. */
const ALL_COMPONENTS = [
  "button",
  "badge",
  "input",
  "card",
  "label",
  "separator",
  "skeleton",
  "table",
  "checkbox",
  "toggle",
  "toggle-group",
  "collapsible",
  "pagination",
  "popover",
  "dropdown-menu",
  "sheet",
  "navigation-menu",
  "chart",
  "kbd",
  "switch",
  "alert",
  "tooltip",
  "tabs",
  "select",
  "article",
];

describe("packageName", () => {
  it("drops a version or range and keeps scoped names whole", () => {
    expect(packageName("recharts@3.8.0")).toBe("recharts");
    expect(packageName("recharts@^3.8.0")).toBe("recharts");
    expect(packageName("@scope/pkg@1.2.3")).toBe("@scope/pkg");
    expect(packageName("@base-ui/react")).toBe("@base-ui/react");
    expect(packageName("class-variance-authority")).toBe("class-variance-authority");
  });
});

describe("importedPackages", () => {
  it("lists npm packages, collapses subpaths and skips react and project aliases", () => {
    const source = `
import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { local } from "./local";
import type { X } from "lodash/fp";
const text = 'import nothing from "ignored"';
`;
    expect(importedPackages(source)).toEqual(["@base-ui/react", "class-variance-authority", "cn", "lodash"]);
  });
});

describe("the component items", () => {
  const loaded = loadComponents(repo, version);

  it("load without problems and are named like the shadcn components they replace", () => {
    expect(loaded.problems).toEqual([]);
    expect(loaded.items.map((item) => item.name)).toEqual(ALL_COMPONENTS);
  });

  it("declare exactly the packages their sources import", () => {
    for (const spec of COMPONENTS) {
      expect(importedPackages(read(spec.file)).join()).toBe(spec.dependencies.map(packageName).sort().join());
    }
  });

  it("pin the one dependency whose version matters", () => {
    expect(COMPONENTS.find((spec) => spec.name === "chart")?.dependencies).toEqual(["cn", "recharts@^3.8.0"]);
  });

  it("depend on each other only through items that exist, without cycles", () => {
    const names = new Set(COMPONENTS.map((spec) => spec.name));
    const edges = new Map(
      COMPONENTS.map((spec) => [
        spec.name,
        spec.registryDependencies
          .filter((dep) => dep.startsWith("@patina/"))
          .map((dep) => dep.slice("@patina/".length)),
      ]),
    );
    for (const [name, deps] of edges) {
      for (const dep of deps) expect(names.has(dep), `${name} depends on missing @patina/${dep}`).toBe(true);
    }
    const visit = (name: string, trail: string[]): void => {
      if (trail.includes(name)) throw new Error(`cycle: ${[...trail, name].join(" -> ")}`);
      for (const dep of edges.get(name) ?? []) visit(dep, [...trail, name]);
    };
    for (const name of names) expect(() => visit(name, [])).not.toThrow();
    // The two that build on another component.
    expect(edges.get("sheet")).toEqual(["button"]);
    expect(edges.get("toggle-group")).toEqual(["toggle"]);
  });

  it("embed the source in a registry:ui item", () => {
    for (const item of loaded.items) {
      expect(item).toMatchObject({
        $schema: "https://ui.shadcn.com/schema/registry-item.json",
        type: "registry:ui",
        meta: { snapshot: version },
      });
      // `cn` is an npm dependency, as in the stock shadcn items, so there is no `utils` file to overwrite.
      expect(item.registryDependencies).not.toContain("utils");
      expect(item.dependencies).toContain("cn");
      const files = item.files as { path: string; type: string; content: string }[];
      expect(files).toHaveLength(1);
      expect(files[0]?.path).toBe(`ui/${item.name}.tsx`);
      expect(files[0]?.type).toBe("registry:ui");
      expect(files[0]?.content).toBe(read(`registry/ui/${item.name}.tsx`));
      expect(files[0]?.content).toContain('import { cn } from "cn";');
      expect(files[0]?.content).not.toContain("@/lib/utils");
    }
  });

  it("do not depend on the base item, so they install on their own", () => {
    for (const item of loaded.items) {
      expect(item.registryDependencies).not.toContain("base");
      expect(item.registryDependencies).not.toContain("@patina/base");
    }
  });
});

describe("generate with components", () => {
  const { items } = loadComponents(repo, version);
  const files = generate(set, version, items);

  it("serves one json file per item and lists them in the index", () => {
    for (const name of ["base", ...ALL_COMPONENTS]) expect(files[`r/${name}.json`]).toBeDefined();
    const index = JSON.parse(files["r/registry.json"] ?? "{}") as { items: { name: string; type: string }[] };
    expect(index.items.map((item) => `${item.name}:${item.type}`)).toEqual([
      "base:registry:base",
      ...ALL_COMPONENTS.map((name) => `${name}:registry:ui`),
    ]);
  });

  it("keeps the base item the same with or without components", () => {
    expect(files["r/base.json"]).toBe(generate(set, version)["r/base.json"]);
    expect(JSON.parse(files["r/base.json"] ?? "{}")).toEqual(JSON.parse(JSON.stringify(baseItem(set, version))));
  });
});

describe("loadComponents detects inconsistent sources", () => {
  const dir = mkdtempSync(join(tmpdir(), "patina-components-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  function copySources(name: string): URL {
    const root = join(dir, name);
    mkdirSync(join(root, "registry/ui"), { recursive: true });
    for (const spec of COMPONENTS) copyFileSync(new URL(spec.file, repo), join(root, spec.file));
    return pathToFileURL(`${root}/`);
  }

  it("passes on an untouched copy", () => {
    expect(loadComponents(copySources("clean"), version).problems).toEqual([]);
  });

  it("reports an import that is not a declared dependency", () => {
    const root = copySources("extra-import");
    const path = new URL("registry/ui/card.tsx", root);
    writeFileSync(path, `import { thing } from "lodash";\n${readFileSync(path, "utf8")}`);
    expect(loadComponents(root, version).problems).toEqual([
      "registry/ui/card.tsx imports [cn, lodash] but card declares dependencies [cn]",
    ]);
  });

  it("reports a declared dependency the source no longer imports", () => {
    const root = copySources("unused");
    const path = new URL("registry/ui/input.tsx", root);
    writeFileSync(path, readFileSync(path, "utf8").replace(/import \{ Input as InputPrimitive \}.*\n/, ""));
    const { problems } = loadComponents(root, version);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("registry/ui/input.tsx imports [cn]");
  });

  it("reports a missing source", () => {
    const root = copySources("missing");
    rmSync(new URL("registry/ui/badge.tsx", root));
    expect(loadComponents(root, version).problems).toEqual(["registry/ui/badge.tsx is missing"]);
  });
});
