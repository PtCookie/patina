// pnpm smoke: install the generated registry base item into a scratch Astro + Tailwind 4 project with the real
// shadcn CLI and check what comes out. It needs the network (npm registry, ui.shadcn.com), takes a minute or two,
// and is therefore not part of `pnpm check`.
//
//   pnpm smoke                    run, clean up afterwards
//   PATINA_SMOKE_KEEP=1 pnpm smoke  keep the scratch project and print its path

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { COMPONENTS, loadComponents } from "../src/components";
import { registryCssVars } from "../src/emit/css";
import { BASE_DEPENDENCIES, FONT_IMPORTS } from "../src/emit/registry";
import { generate } from "../src/generate";
import { parseTokens } from "../src/tokens";
import { verifyTokens } from "../src/verify";

const root = new URL("../", import.meta.url);
const read = (path: string): string => readFileSync(new URL(path, root), "utf8");

const failures: string[] = [];
let checks = 0;

function check(condition: boolean, message: string): void {
  checks += 1;
  if (!condition) failures.push(message);
}

function step(message: string): void {
  console.log(`\n▶ ${message}`);
}

interface Result {
  code: number | null;
  output: string;
}

/** Runs a command without stdin, so a CLI that wants to prompt fails instead of waiting. */
function run(command: string, args: string[], cwd: string, timeoutMs = 300_000): Promise<Result> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        CI: "1",
        NO_COLOR: "1",
        // The same node that runs this script, wherever version managers put it.
        PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH ?? ""}`,
      },
    });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => (output += chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => (output += chunk.toString()));
    const timer = setTimeout(() => child.kill(), timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: null, output: `${output}\n${error.message}` });
    });
  });
}

const tail = (output: string, lines = 12): string => output.trim().split("\n").slice(-lines).join("\n");

/** The body of the first top-level block that starts with `selector {`. */
function block(css: string, selector: string): string {
  const start = css.search(new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`, "m"));
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  const end = css.indexOf("\n}", open);
  return css.slice(open + 1, end < 0 ? css.length : end);
}

// Server-rendered only (no client directive): the HTML shows which classes the components produce.
const PAGE = `---
import "../styles/global.css";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Demo } from "../components/demo";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Article, ArticleEyebrow } from "../components/ui/article";
import { Kbd } from "../components/ui/kbd";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Toggle } from "../components/ui/toggle";
---
<html lang="en">
  <head><meta charset="utf-8" /><title>Patina smoke</title></head>
  <body>
    <h1 class="font-heading text-link">Patina</h1>
    <p class="font-serif italic text-muted-foreground">Quote</p>
    <div class="rounded-xl bg-card shadow-card border">Theme utilities</div>
    <div id="buttons">
      <Button id="b-default">Primary</Button>
      <Button id="b-outline-pill" variant="outline" shape="pill">Outline</Button>
      <Button id="b-secondary" variant="secondary" size="sm">Secondary</Button>
      <Button id="b-ghost" variant="ghost" size="xs">Ghost</Button>
      <Button id="b-destructive" variant="destructive" size="lg">Delete</Button>
      <Button id="b-link" variant="link">Link</Button>
      <Button id="b-icon" variant="outline" size="icon" aria-label="Settings">S</Button>
    </div>
    <div id="badges">
      <Badge id="g-default">Default</Badge>
      <Badge id="g-success" variant="success">Success</Badge>
      <Badge id="g-outline" variant="outline">Outline</Badge>
    </div>
    <Input id="i-default" placeholder="Branch name" />
    <Input id="i-pill-invalid" shape="pill" aria-invalid="true" placeholder="Invalid" />
    <Card id="c-sm" size="sm" interactive>
      <CardHeader><CardTitle>Title</CardTitle><CardDescription>Description</CardDescription></CardHeader>
      <CardContent>Content</CardContent>
      <CardFooter><Button size="sm">Save</Button></CardFooter>
    </Card>
    <Label id="l-name" htmlFor="name">Issuer</Label>
    <Separator id="s-h" />
    <Separator id="s-v" orientation="vertical" />
    <Skeleton id="k-default" class="h-3.5 w-48" />
    <Skeleton id="k-circle" shape="circle" class="size-10" />
    <Table id="t-main" containerClassName="max-h-64">
      <TableHeader><TableRow><TableHead id="th-text">Commit</TableHead><TableHead id="th-num" numeric>Files</TableHead></TableRow></TableHeader>
      <TableBody><TableRow id="tr-selected" data-state="selected"><TableCell id="td-mono" mono>a3f9c21</TableCell><TableCell id="td-num" numeric>12</TableCell></TableRow></TableBody>
    </Table>
    <Checkbox id="x-box" aria-label="Sign commits" defaultChecked />
    <Toggle id="tg-outline" variant="outline" size="sm">Filters</Toggle>
    <Alert id="al-success" variant="success"><svg /><AlertTitle>Pushed</AlertTitle><AlertDescription id="al-desc">3 commits.</AlertDescription></Alert>
    <Alert id="al-destructive" variant="destructive"><svg /><AlertTitle>Failed</AlertTitle><AlertDescription>Host key.</AlertDescription></Alert>
    <Kbd id="kbd">⌘K</Kbd>
    <Article id="article"><ArticleEyebrow id="eyebrow">Release notes</ArticleEyebrow><h1>Title</h1></Article>
    <Demo />
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious id="pg-prev" href="#1" /></PaginationItem>
        <PaginationItem><PaginationLink id="pg-1" href="#1">1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink id="pg-2" href="#2" isActive>2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationEllipsis id="pg-dots" /></PaginationItem>
        <PaginationItem><PaginationNext id="pg-next" href="#3" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  </body>
</html>
`;

// Compositions that rely on React context (toggle groups, collapsibles, charts) have to be built in a React file:
// in an .astro file every nested component becomes its own React root and loses the context.
const DEMO = `import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, chartBarRadius } from "./ui/chart";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const chartData = [
  { week: "Sep 15", commits: 35 },
  { week: "Sep 22", commits: 28 },
];
const chartConfig = { commits: { label: "Commits", color: "var(--chart-3)" } };

export function Demo() {
  return (
    <>
      <ToggleGroup id="tgg" defaultValue={["3M"]} aria-label="Period">
        <ToggleGroupItem id="tgg-1" value="1M">1M</ToggleGroupItem>
        <ToggleGroupItem id="tgg-2" value="3M">3M</ToggleGroupItem>
      </ToggleGroup>
      <Collapsible defaultOpen>
        <CollapsibleTrigger id="co-trigger" aria-label="Toggle">v</CollapsibleTrigger>
        <CollapsibleContent>Pinned</CollapsibleContent>
      </Collapsible>
      <Switch id="sw" defaultChecked aria-label="Auto-fetch" />
      <Tabs defaultValue="changes">
        <TabsList>
          <TabsTrigger id="tab-1" value="changes">Changes</TabsTrigger>
          <TabsTrigger id="tab-2" value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="changes">4 changed files</TabsContent>
      </Tabs>
      <Select defaultValue="main">
        <SelectTrigger id="sel" shape="pill" aria-label="Branch"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="main">main</SelectItem></SelectContent>
      </Select>
      <TooltipProvider>
        <Tooltip><TooltipTrigger id="tip">Hover</TooltipTrigger><TooltipContent>Tip</TooltipContent></Tooltip>
      </TooltipProvider>
      <ChartContainer id="chart" config={chartConfig}>
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="commits" fill="var(--color-commits)" radius={chartBarRadius} />
        </BarChart>
      </ChartContainer>
    </>
  );
}
`;

/** The \`class\` attribute of the element with the given id in server-rendered HTML. */
function classOf(html: string, id: string): string[] {
  return classesOfTag(new RegExp(`<[a-z]+[^>]*\\bid="${id}"[^>]*>`).exec(html)?.[0] ?? "");
}

/** The classes of the first element with the given `data-slot` (a Base UI root may not carry the id). */
function classOfSlot(html: string, slot: string): string[] {
  return classesOfTag(new RegExp(`<[a-z]+[^>]*\\bdata-slot="${slot}"[^>]*>`).exec(html)?.[0] ?? "");
}

function classesOfTag(tag: string): string[] {
  const raw = /\bclass="([^"]*)"/.exec(tag)?.[1] ?? "";
  const decoded = raw
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
  return decoded.split(/\s+/).filter(Boolean);
}

function writeProject(dir: string): void {
  mkdirSync(join(dir, "src/pages"), { recursive: true });
  mkdirSync(join(dir, "src/components"), { recursive: true });
  mkdirSync(join(dir, "src/styles"), { recursive: true });
  const files: Record<string, string> = {
    "package.json": `${JSON.stringify({ name: "patina-smoke", private: true, type: "module" }, null, 2)}\n`,
    "pnpm-workspace.yaml": "allowBuilds:\n  esbuild: true\n  sharp: true\n",
    "astro.config.mjs": `import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
`,
    "tsconfig.json": `${JSON.stringify(
      {
        extends: "astro/tsconfigs/strict",
        include: [".astro/types.d.ts", "**/*"],
        exclude: ["dist"],
        compilerOptions: { jsx: "react-jsx", jsxImportSource: "react", paths: { "@/*": ["./src/*"] } },
      },
      null,
      2,
    )}\n`,
    "src/styles/global.css": '@import "tailwindcss";\n',
    "src/pages/index.astro": PAGE,
    "src/components/demo.tsx": DEMO,
  };
  for (const [path, content] of Object.entries(files)) writeFileSync(join(dir, path), content);
  // Keep the Node version the repo uses, for version managers that read this file.
  if (existsSync(new URL(".node-version", root)))
    copyFileSync(new URL(".node-version", root), join(dir, ".node-version"));
}

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

async function main(): Promise<void> {
  step("Verify the tokens and generate the registry files");
  const set = parseTokens(JSON.parse(read("design-system/tokens.json")));
  const version = read("design-system/VERSION").trim();
  const problems = verifyTokens(set);
  if (problems.length > 0) throw new Error(`The tokens fail ${problems.length} check(s); run pnpm build.`);
  const components = loadComponents(root, version);
  if (components.problems.length > 0) throw new Error(`Components fail:\n  ${components.problems.join("\n  ")}`);
  const files = generate(set, version, components.items);
  const vars = registryCssVars(set);

  // Like any static host, ignore the query string: the CLI requests `/r/base.json?base=base`.
  const server = createServer((request, response) => {
    const body = files[new URL(request.url ?? "/", "http://localhost").pathname.replace(/^\//, "")];
    response.writeHead(body === undefined ? 404 : 200, { "content-type": "application/json" });
    response.end(body ?? "{}");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/r/base.json`;

  const dir = mkdtempSync(join(tmpdir(), "patina-smoke-"));
  try {
    step(`Scratch project in ${dir}`);
    writeProject(dir);

    step("Install dependencies");
    for (const args of [
      ["add", "astro", "@astrojs/react", "react", "react-dom", "tailwindcss", "@tailwindcss/vite"],
      ["add", "-D", "typescript", "@types/react", "@types/react-dom", "shadcn"],
    ]) {
      const install = await run("pnpm", args, dir);
      if (install.code !== 0) throw new Error(`pnpm ${args.join(" ")} failed:\n${tail(install.output)}`);
    }

    step(`shadcn init ${baseUrl}`);
    const init = await run("pnpm", ["exec", "shadcn", "init", baseUrl, "--yes"], dir);
    // Nothing after a failed init is meaningful, so stop here instead of piling up follow-up failures.
    if (init.code !== 0) throw new Error(`shadcn init exited with ${init.code}:\n${tail(init.output)}`);
    {
      const components = JSON.parse(readFileSync(join(dir, "components.json"), "utf8")) as {
        style?: string;
        iconLibrary?: string;
        tailwind?: { baseColor?: string };
      };
      check(components.style === "base-luma", `components.json style is ${components.style}, expected base-luma`);
      check(components.tailwind?.baseColor === "mist", `baseColor is ${components.tailwind?.baseColor}, expected mist`);
      check(components.iconLibrary === "phosphor", `iconLibrary is ${components.iconLibrary}, expected phosphor`);

      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const installed = { ...pkg.dependencies, ...pkg.devDependencies };
      const missing = BASE_DEPENDENCIES.filter((name) => !(name in installed));
      check(missing.length === 0, `dependencies not installed by init: ${missing.join(", ")}`);

      const css = readFileSync(join(dir, "src/styles/global.css"), "utf8");
      for (const path of FONT_IMPORTS) check(css.includes(`@import "${path}";`), `global.css lacks @import "${path}"`);
      check(css.includes('@import "tw-animate-css";'), 'global.css lacks @import "tw-animate-css"');

      const themeBlock = block(css, "@theme inline");
      const rootBlock = block(css, ":root");
      const darkBlock = block(css, ".dark");
      check(
        themeBlock !== "" && rootBlock !== "" && darkBlock !== "",
        "global.css lacks @theme inline, :root or .dark",
      );
      const missingVars = [
        ...Object.entries(vars.theme)
          .filter(([k, v]) => !themeBlock.includes(`--${k}: ${v};`))
          .map(([k]) => `theme ${k}`),
        ...Object.entries(vars.light)
          .filter(([k, v]) => !rootBlock.includes(`--${k}: ${v};`))
          .map(([k]) => `:root ${k}`),
        ...Object.entries(vars.dark)
          .filter(([k, v]) => !darkBlock.includes(`--${k}: ${v};`))
          .map(([k]) => `.dark ${k}`),
      ];
      check(
        missingVars.length === 0,
        `${missingVars.length} variable(s) missing or changed in global.css: ${missingVars.slice(0, 8).join(", ")}`,
      );
      check(existsSync(join(dir, "src/lib/utils.ts")), "init did not write src/lib/utils.ts");
    }

    step("shadcn add @patina/* (the Patina components, through the @patina namespace)");
    const componentsJson = join(dir, "components.json");
    const config = JSON.parse(readFileSync(componentsJson, "utf8")) as { registries?: Record<string, string> };
    config.registries = { ...config.registries, "@patina": `http://127.0.0.1:${port}/r/{name}.json` };
    writeFileSync(componentsJson, `${JSON.stringify(config, null, 2)}\n`);
    const names = COMPONENTS.map((component) => component.name);
    // `button` and `toggle` are left off the command line: they must arrive as the dependencies of `sheet` and
    // `toggle-group`, which also checks that the `@patina/…` registry dependencies resolve.
    const explicit = names.filter((name) => name !== "button" && name !== "toggle");
    const patina = await run(
      "pnpm",
      ["exec", "shadcn", "add", ...explicit.map((name) => `@patina/${name}`), "--yes"],
      dir,
    );
    check(patina.code === 0, `shadcn add @patina/* exited with ${patina.code}:\n${tail(patina.output)}`);
    const squash = (text: string): string => text.replace(/\s+/g, "");
    for (const spec of COMPONENTS) {
      const path = join(dir, `src/components/ui/${spec.name}.tsx`);
      const installed = existsSync(path) ? readFileSync(path, "utf8") : "";
      check(installed !== "", `${spec.name}.tsx was not installed`);
      // The CLI may reformat a file, but it must not change what is in it.
      check(
        squash(installed) === squash(read(spec.file)),
        `${spec.name}.tsx differs from registry source ${spec.file}`,
      );
      check(!installed.includes("color-mix"), `${spec.name}.tsx computes a colour with color-mix`);
    }
    const sheet = existsSync(join(dir, "src/components/ui/sheet.tsx"))
      ? readFileSync(join(dir, "src/components/ui/sheet.tsx"), "utf8")
      : "";
    check(sheet.includes('from "./button"'), "sheet.tsx does not import the installed button");
    const sourcePackages = readFileSync(join(dir, "package.json"), "utf8");
    check(sourcePackages.includes('"recharts"'), "recharts was not installed for the chart");

    // A stock component that Patina does not replace still comes from the stock registry, with Phosphor icons.
    step("shadcn add accordion (a stock component)");
    const add = await run("pnpm", ["exec", "shadcn", "add", "accordion", "--yes"], dir);
    check(add.code === 0, `shadcn add accordion exited with ${add.code}:\n${tail(add.output)}`);
    const accordionPath = join(dir, "src/components/ui/accordion.tsx");
    if (existsSync(accordionPath)) {
      const accordion = readFileSync(accordionPath, "utf8");
      check(accordion.includes("@phosphor-icons/react"), "accordion does not import @phosphor-icons/react");
      check(!accordion.includes("lucide-react"), "accordion still imports lucide-react");
      check(accordion.includes("@base-ui/react"), "accordion does not use @base-ui/react");
    } else {
      check(false, "accordion.tsx was not created");
    }

    step("astro build");
    const build = await run("pnpm", ["exec", "astro", "build"], dir);
    check(build.code === 0, `astro build exited with ${build.code}:\n${tail(build.output)}`);
    const dist = join(dir, "dist");
    const cssFile = listFiles(dist).find((path) => /\/_astro\/index\..+\.css$/.test(path));
    if (cssFile) {
      const built = readFileSync(cssFile, "utf8");
      const expected: [string, string][] = [
        [".text-link{color:var(--link)}", "text-link utility"],
        [".bg-primary{background-color:var(--primary)}", "bg-primary utility"],
        [":hover{background-color:var(--primary-hover)}", "hover:bg-primary-hover utility"],
        [".rounded-lg{border-radius:var(--radius)}", "rounded-lg follows --radius"],
        [".rounded-xl{border-radius:10px}", "rounded-xl is 10px"],
        [".font-heading{font-family:JetBrains Mono Variable,Pretendard Variable,", "font-heading stack"],
        [".shadow-card{--tw-shadow:var(--shadow-card)", "shadow-card utility"],
      ];
      for (const [needle, label] of expected) check(built.includes(needle), `built CSS lacks ${label} (${needle})`);

      // Utilities the components rely on: sizes from the size tokens, colours from the derived tokens.
      const componentCss: [string, string][] = [
        [".h-\\(--control-md\\){height:var(--control-md)}", "control-md height"],
        [".size-\\(--control-md\\){width:var(--control-md);height:var(--control-md)}", "icon button size"],
        [".bg-outline-fill{background-color:var(--outline-fill)}", "outline-fill background"],
        [".hover\\:bg-ghost-hover", "ghost hover background"],
        [".bg-destructive-muted{background-color:var(--destructive-muted)}", "destructive-muted background"],
        [".bg-control{background-color:var(--control)}", "control fill"],
        [".bg-success-muted{background-color:var(--success-muted)}", "success-muted background"],
        [".rounded-3xl{border-radius:16px}", "card radius"],
        [".rounded-full{border-radius:9999px}", "pill radius"],
        [".shadow-\\(--shadow-card\\)", "card shadow"],
        [".focus-visible\\:outline-ring", "focus ring colour"],
        [".aria-invalid\\:ring-invalid-ring", "invalid ring colour"],
        // Used by the components that only render when open (menus, popovers, sheets, navigation panels).
        [".rounded-2xl{border-radius:12px}", "menu and popover radius"],
        [".bg-popover{background-color:var(--popover)}", "popover surface"],
        [".shadow-\\(--shadow-menu\\)", "menu shadow"],
        [".bg-overlay{background-color:var(--overlay)}", "sheet overlay colour"],
        [".data-highlighted\\:bg-accent", "menu row highlight"],
        [".data-highlighted\\:bg-destructive-muted", "destructive menu row highlight"],
        [".min-w-48{min-width:calc(var(--spacing) * 48)}", "menu minimum width"],
        [".hover\\:bg-muted-hover", "table row hover tint"],
        [".h-\\(--table-head\\){height:var(--table-head)}", "table header height"],
        [".data-\\[state\\=selected\\]\\:bg-muted", "selected table row"],
        [".bg-control-strong{background-color:var(--control-strong)}", "checkbox fill"],
        [".recharts-bar-rectangle\\:hover_\\.recharts-rectangle\\]\\:fill-chart-4", "chart bar hover"],
        [".tracking-widest", "menu shortcut tracking"],
        [".animate-pulse", "skeleton pulse"],
        [".h-5\\.5{height:calc(var(--spacing) * 5.5)}", "kbd height"],
        [".min-w-5\\.5{min-width:calc(var(--spacing) * 5.5)}", "kbd width"],
        [".w-11{width:calc(var(--spacing) * 11)}", "switch width"],
        [".data-checked\\:bg-primary", "switch on state"],
        [".bg-switch-thumb{background-color:var(--switch-thumb)}", "switch thumb"],
        [".bg-success-muted{background-color:var(--success-muted)}", "alert tint"],
        [".data-active\\:bg-tab-active", "active tab"],
        [".text-tab-foreground", "tab text"],
        [".max-w-172{max-width:calc(var(--spacing) * 172)}", "article column"],
        [".bg-foreground{background-color:var(--foreground)}", "tooltip surface"],
        [".min-w-\\(--anchor-width\\)", "select list width"],
      ];
      for (const [needle, label] of componentCss) check(built.includes(needle), `built CSS lacks ${label} (${needle})`);
    } else {
      check(false, "astro build produced no stylesheet");
    }
    const htmlPath = join(dist, "index.html");
    if (existsSync(htmlPath)) {
      const html = readFileSync(htmlPath, "utf8");
      const has = (id: string, ...classes: string[]): boolean => {
        const present = classOf(html, id);
        return classes.every((name) => present.includes(name));
      };
      const lacks = (id: string, ...classes: string[]): boolean => {
        const present = classOf(html, id);
        return classes.every((name) => !present.includes(name));
      };
      check(
        has("b-default", "bg-primary", "hover:bg-primary-hover", "h-(--control-md)", "rounded-lg", "cursor-pointer"),
        "default button classes",
      );
      // The shape and size variants replace the defaults instead of stacking on them.
      check(
        has("b-outline-pill", "rounded-full", "border-border") && lacks("b-outline-pill", "rounded-lg"),
        "pill button keeps rounded-lg",
      );
      check(has("b-secondary", "hover:bg-secondary-hover", "h-(--control-sm)"), "secondary small button classes");
      check(
        has("b-ghost", "hover:bg-ghost-hover", "h-(--control-xs)", "text-xs") && lacks("b-ghost", "text-sm"),
        "ghost xs button classes",
      );
      check(has("b-destructive", "bg-destructive-muted", "h-(--control-lg)"), "destructive large button classes");
      check(has("b-link", "text-link", "hover:underline"), "link button classes");
      check(has("b-icon", "size-(--control-md)"), "icon button classes");
      check(has("g-success", "bg-success-muted", "text-success", "rounded-full", "h-5"), "success badge classes");
      check(
        has("i-default", "bg-control", "rounded-lg", "h-(--control-md)") && lacks("i-default", "rounded-full"),
        "input classes",
      );
      check(
        has("i-pill-invalid", "rounded-full", "aria-invalid:ring-invalid-ring") &&
          lacks("i-pill-invalid", "rounded-lg"),
        "pill input classes",
      );
      check(
        has(
          "c-sm",
          "rounded-3xl",
          "bg-card",
          "shadow-(--shadow-card)",
          "hover:shadow-(--shadow-card-hover)",
          "cursor-pointer",
        ),
        "interactive card classes",
      );
      check(/id="c-sm"[^>]*data-size="sm"|data-size="sm"[^>]*id="c-sm"/.test(html), "card lacks data-size=sm");

      // The rest of the components that render on the server.
      check(has("l-name", "text-sm", "font-medium", "text-foreground", "leading-none"), "label classes");
      check(
        has("s-h", "bg-border", "data-[orientation=horizontal]:h-px") && has("s-v", "data-[orientation=vertical]:w-px"),
        "separator classes",
      );
      check(
        has("k-default", "animate-pulse", "bg-muted", "rounded-md") && lacks("k-default", "rounded-full"),
        "skeleton classes",
      );
      check(has("k-circle", "rounded-full") && lacks("k-circle", "rounded-md"), "circle skeleton keeps rounded-md");
      check(has("th-text", "h-(--table-head)", "text-left") && lacks("th-text", "text-right"), "table head classes");
      check(has("th-num", "text-right", "tabular-nums") && lacks("th-num", "text-left"), "numeric head classes");
      check(
        has("td-mono", "font-mono", "text-[13px]/5") && has("td-num", "text-right", "tabular-nums"),
        "table cell classes",
      );
      check(
        has("tr-selected", "border-border", "hover:bg-muted-hover", "data-[state=selected]:bg-muted"),
        "table row classes",
      );
      const box = classOfSlot(html, "checkbox");
      check(
        ["size-4", "rounded-sm", "bg-control-strong", "data-checked:bg-primary"].every((name) => box.includes(name)),
        "checkbox classes",
      );
      check(has("tg-outline", "border-input", "h-(--control-sm)", "rounded-lg"), "outline toggle classes");
      check(
        has("tgg-1", "rounded-none", "first:rounded-l-lg", "last:rounded-r-lg") && lacks("tgg-1", "rounded-lg"),
        "toggle group item classes",
      );
      check(has("co-trigger", "data-panel-open:[&>svg]:rotate-180"), "collapsible trigger classes");
      check(
        has("pg-1", "h-(--control-md)", "rounded-lg", "hover:bg-muted", "px-2.5") && has("pg-prev", "pl-2", "pr-2.5"),
        "pagination link classes",
      );
      check(
        has("pg-2") && /id="pg-2"[^>]*aria-current="page"|aria-current="page"[^>]*id="pg-2"/.test(html),
        "current page",
      );
      check(has("pg-dots", "text-muted-foreground", "pointer-events-none"), "pagination ellipsis classes");
      check(has("kbd", "h-5.5", "bg-muted", "rounded-sm", "text-muted-foreground"), "kbd classes");
      check(
        has("al-success", "bg-success-muted", "text-success", "rounded-2xl") && lacks("al-success", "bg-card"),
        "success alert classes",
      );
      check(has("al-destructive", "text-destructive", "bg-card", "border-border"), "destructive alert classes");
      check(has("article", "font-serif", "max-w-172", "[&_h1]:font-heading"), "article classes");
      check(has("eyebrow", "font-sans", "text-xs/4"), "article eyebrow classes");
      check(
        ["w-11", "h-5", "bg-control-strong", "data-checked:bg-primary"].every((name) =>
          classOfSlot(html, "switch").includes(name),
        ) && html.includes("data-checked"),
        "switch classes or data-checked",
      );
      check(
        classOfSlot(html, "tabs-list").includes("rounded-full") &&
          has("tab-1", "data-active:bg-tab-active", "text-tab-foreground"),
        "tabs classes",
      );
      check(html.includes("data-active"), "the selected tab has no data-active");
      check(
        has("sel", "rounded-full", "bg-control", "h-(--control-md)") && lacks("sel", "rounded-lg"),
        "pill select trigger classes",
      );
      check(has("tip") || html.includes('data-slot="tooltip-trigger"'), "tooltip trigger did not render");
      check(
        html.includes('data-chart="chart-chart"') && html.includes("recharts-surface"),
        "chart did not render an svg",
      );
      check(html.includes("--color-commits: var(--chart-3)"), "chart did not expose its series colour");
      // Bars are not asserted: ResponsiveContainer has no size on the server, so they render on the client only.
    } else {
      check(false, "astro build produced no index.html");
    }

    step("Type-check the installed components");
    const types = await run("pnpm", ["exec", "tsc", "--noEmit"], dir);
    check(types.code === 0, `tsc --noEmit exited with ${types.code}:\n${tail(types.output)}`);

    const fonts = listFiles(dist).filter((path) => path.endsWith(".woff2"));
    check(fonts.length > 0, "the build bundled no woff2 files, so fonts are not self-hosted");
    console.log(`  ${fonts.length} woff2 files bundled`);
  } finally {
    server.close();
    if (process.env.PATINA_SMOKE_KEEP) console.log(`\nKept scratch project: ${dir}`);
    else rmSync(dir, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

if (failures.length > 0) {
  console.error(`\n✖ Smoke test failed (${failures.length} problem(s), ${checks} checks run):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`\n✔ Smoke test passed (${checks} checks).`);
