import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import * as slint from "slint-ui";
import { afterAll, describe, expect, it } from "vitest";
import { loadSlintLibrary } from "../src/slint-lib";
import { generate } from "../src/generate";
import { parseTokens } from "../src/tokens";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");
const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();
const library = loadSlintLibrary(root);

const dir = mkdtempSync(join(tmpdir(), "patina-slint-lib-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Writes the library as the build serves it (hand-written files plus the generated tokens). */
function install(name: string, edit: (files: Record<string, string>) => void = () => undefined): string {
  const files = { ...generate(set, version, [], undefined, library) };
  edit(files);
  const base = join(dir, name);
  for (const [path, text] of Object.entries(files).filter(([path]) => path.startsWith("slint/"))) {
    const target = join(base, path.slice("slint/".length));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  return join(base, "patina.slint");
}

const compile = (entry: string, source: string) => {
  const app = join(dirname(entry), "app.slint");
  writeFileSync(app, source);
  return slint.loadFile(app, { libraryPaths: { patina: entry } });
};

/** The components that `patina.slint` re-exports from components/*.slint. */
const exported = [...(library["slint/patina.slint"] ?? "").matchAll(/export \{([^}]*)\} from "components\//g)]
  .flatMap((match) => (match[1] ?? "").split(","))
  .map((name) => name.trim())
  .filter(Boolean);

describe("the library sources", () => {
  const files = Object.entries(library);

  it("include the entry file and one file per component", () => {
    expect(Object.keys(library)).toEqual(
      expect.arrayContaining(["slint/patina.slint", "slint/components/button.slint", "slint/components/input.slint"]),
    );
    expect(exported).toEqual(
      expect.arrayContaining([
        "Button",
        "Input",
        "Badge",
        "Kbd",
        "Separator",
        "Tooltip",
        "TreeRow",
        "ListRow",
        "PaneHeader",
      ]),
    );
  });

  it("never write a colour literal: colours come from Theme", () => {
    const offenders = files
      .filter(([, text]) =>
        /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsv\(|\boklch\(|@linear-gradient/.test(text.replace(/\/\/.*$/gm, "")),
      )
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("never fix a size that a token provides", () => {
    // Control, row and header heights, radii and spacing are tokens; a literal here would drift from the design.
    const offenders = files
      .filter(([path]) => path.startsWith("slint/components/"))
      .filter(([, text]) => /border-radius:\s*\d+px|(?:padding|spacing)[a-z-]*:\s*\d+px/.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("do not import anything outside the library", () => {
    const outside = files
      .flatMap(([path, text]) => [...text.matchAll(/^import .* from "([^"]+)";/gm)].map((match) => [path, match[1]]))
      .filter(([, target]) => target !== undefined && !target.startsWith(".") && !/^[a-z-]+\.slint$/.test(target));
    expect(outside).toEqual([]);
  });
});

describe("the Slint compiler", () => {
  it("compiles the whole library through the @patina entry file", () => {
    const entry = install("full");
    const ui = compile(
      entry,
      `import { Theme, ThemeMode, Typography, Button, ButtonVariant, Input, Badge, BadgeVariant, Kbd, Separator, Tooltip, TreeRow, ListRow, PaneHeader } from "@patina";
export component App inherits Window {
    in-out property <ThemeMode> mode <=> Theme.current-mode;
    background: Theme.current.background;
    VerticalLayout {
        PaneHeader { text: "Branches"; Button { variant: ButtonVariant.ghost; tooltip: "More"; } }
        Button { text: "Commit"; tooltip: "Commit changes"; tooltip-shortcut: "⌘↵"; }
        Input { placeholder-text: "Filter"; }
        Badge { text: "Merged"; variant: BadgeVariant.success; }
        Kbd { text: "K"; }
        Separator { }
        Tooltip { text: "Hint"; shortcut: "⌘S"; }
        TreeRow { text: "main"; count: "2"; selected: true; }
        ListRow { text: "repo.rs"; detail: "src/git"; }
        Text { font-family: Typography.body.font-family; text: "x"; }
    }
}
`,
    ) as Record<string, unknown>;
    expect(typeof ui.App).toBe("function");
  });

  it("compiles every component on its own", () => {
    const entry = install("each");
    const uncompiled = exported
      .filter((name) => !name.endsWith("Variant") && name !== "Theme")
      .filter((name) => {
        const ui = compile(
          entry,
          `import { ${name} } from "@patina";\nexport component App inherits Window { ${name} { } }\n`,
        ) as Record<string, unknown>;
        return typeof ui.App !== "function";
      });
    expect(uncompiled).toEqual([]);
  });

  it("compiles the development gallery against the library", () => {
    const entry = install("gallery");
    const gallery = new URL("scripts/slint/gallery.slint", root).pathname;
    const ui = slint.loadFile(gallery, { libraryPaths: { patina: entry } }) as Record<string, unknown>;
    expect(typeof ui.Shell).toBe("function");
    expect(typeof ui.Board).toBe("function");
  });

  it("rejects a component that reads a token which does not exist (negative control)", () => {
    const entry = install("broken", (files) => {
      const path = "slint/components/kbd.slint";
      files[path] = (files[path] ?? "").replace("Theme.current.muted;", "Theme.current.no-such-token;");
    });
    expect(() =>
      compile(entry, `import { Kbd } from "@patina";\nexport component App inherits Window { Kbd { } }\n`),
    ).toThrow(/Could not compile/);
  });
});

describe("loadSlintLibrary", () => {
  it("skips the generated tokens copy that the build leaves beside the sources", () => {
    expect(Object.keys(library)).not.toContain("slint/tokens.slint");
  });
});
