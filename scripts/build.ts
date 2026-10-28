// pnpm build: verify design-system/tokens.json and the font files, then write the generated files to public/.
// The build reads only files in this repo and never touches the network. By default it also builds the documentation
// site (site/, Astro and Starlight) and merges it into public/; `--no-site` skips that and writes only the files.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPONENTS, loadComponents } from "../src/components.ts";
import { agentDocs } from "../src/agent-docs.ts";
import { androidArchive, slintArchive } from "../src/emit/archive.ts";
import { loadFonts } from "../src/fonts.ts";
import { generate } from "../src/generate.ts";
import { loadAndroidLibrary, loadPhosphorIcons } from "../src/android-lib.ts";
import { GENERATED_TOKENS, loadSlintLibrary } from "../src/slint-lib.ts";
import { parseTokens } from "../src/tokens.ts";
import { verifyTokens } from "../src/verify.ts";

const root = new URL("../", import.meta.url);
const read = (path: string): string => readFileSync(new URL(path, root), "utf8");

const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
const version = read("design-system/VERSION").trim();
const fonts = loadFonts(root, set);
const components = loadComponents(root, version);

const problems = [...verifyTokens(set), ...fonts.problems, ...components.problems];
if (problems.length > 0) {
  console.error(`Snapshot ${version} failed ${problems.length} check(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const out = new URL("public/", root);
rmSync(out, { recursive: true, force: true });
const text = generate(
  set,
  version,
  components.items,
  { specs: COMPONENTS, docs: agentDocs(root) },
  loadSlintLibrary(root),
  { library: loadAndroidLibrary(root), icons: loadPhosphorIcons(root) },
);
const files: Record<string, string | Buffer> = {
  ...text,
  "slint/patina-slint.tar.gz": slintArchive(text),
  "android/patina-android.tar.gz": androidArchive(text),
  LICENSE: read("LICENSE"),
  "THIRD_PARTY_NOTICES.md": read("THIRD_PARTY_NOTICES.md"),
  ...fonts.assets,
};
for (const [path, content] of Object.entries(files)) {
  const target = fileURLToPath(new URL(path, out));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}
// A copy of the generated tokens beside the Slint sources (git-ignored), so slint-lsp and editors resolve
// `import … from "tokens.slint"` when you open slint/patina.slint or a component from the repo.
writeFileSync(fileURLToPath(new URL(`slint/${GENERATED_TOKENS}`, root)), text["slint/tokens.slint"] ?? "");
console.log(`Wrote ${Object.keys(files).length} files to public/ from snapshot ${version}.`);

if (!process.argv.includes("--no-site")) {
  const site = spawnSync("pnpm", ["--filter", "@patina/site", "build"], { cwd: fileURLToPath(root), stdio: "inherit" });
  if (site.status !== 0) {
    console.error("The documentation site failed to build.");
    process.exit(1);
  }
  // The site and the generated files share one folder: a path that both write would hide one of them.
  const dist = fileURLToPath(new URL("site/dist/", root));
  const target = fileURLToPath(out);
  const collisions: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path, `${prefix}${name}/`);
      else if (existsSync(join(target, prefix, name))) collisions.push(`${prefix}${name}`);
    }
  };
  walk(dist, "");
  if (collisions.length > 0) {
    console.error(`The site and the generated files both write: ${collisions.join(", ")}`);
    process.exit(1);
  }
  cpSync(dist, target, { recursive: true });
  console.log("Merged the documentation site into public/.");
}
