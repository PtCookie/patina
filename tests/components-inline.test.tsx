import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "../registry/ui/alert.tsx";
import { Article, ArticleEyebrow } from "../registry/ui/article.tsx";
import { Kbd, KbdGroup } from "../registry/ui/kbd.tsx";
import { Switch } from "../registry/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../registry/ui/tabs.tsx";

/** The class list of the element that carries `data-slot="<slot>"`. */
function slotClasses(markup: string, slot: string): string[] {
  const raw = new RegExp(`<[a-z]+\\b[^>]*data-slot="${slot}"[^>]*class="([^"]*)"`).exec(markup)?.[1] ?? "";
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .split(/\s+/)
    .filter(Boolean);
}

/** The class list of the first element (or of the first `<tag>`) in rendered markup, entities decoded. */
function classes(markup: string, tag?: string): string[] {
  const pattern = tag ? new RegExp(`<${tag}\\b[^>]*class="([^"]*)"`) : /class="([^"]*)"/;
  const raw = (pattern.exec(markup)?.[1] ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
  return raw.split(/\s+/).filter(Boolean);
}

describe("Kbd", () => {
  it("is a 22px chip on the muted fill with muted 12px medium text", () => {
    const markup = renderToStaticMarkup(<Kbd>⌘</Kbd>);
    expect(markup).toMatch(/^<kbd /);
    for (const name of [
      "h-5.5",
      "min-w-5.5",
      "rounded-sm",
      "bg-muted",
      "px-1.5",
      "font-sans",
      "text-xs/4",
      "font-medium",
      "text-muted-foreground",
    ]) {
      expect(classes(markup)).toContain(name);
    }
  });

  it("groups keys with a 4px gap", () => {
    const markup = renderToStaticMarkup(
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );
    expect(classes(markup)).toEqual(expect.arrayContaining(["inline-flex", "gap-1"]));
  });
});

describe("Switch", () => {
  it("is a 44x20 track with a 24x16 thumb that fills primary when on", () => {
    const markup = renderToStaticMarkup(<Switch defaultChecked />);
    for (const name of [
      "h-5",
      "w-11",
      "rounded-full",
      "border-2",
      "border-transparent",
      "bg-control-strong",
      "cursor-pointer",
      "data-checked:bg-primary",
      "data-checked:border-primary",
    ]) {
      expect(classes(markup, "span")).toContain(name);
    }
    // Base UI marks the state as `data-checked`; a variant on any other attribute would never apply.
    expect(markup).toContain("data-checked");
    expect(markup).toContain('role="switch"');
    const thumb = classes(markup.slice(markup.indexOf('data-slot="switch-thumb"') - 200), "span");
    expect(thumb).toEqual(
      expect.arrayContaining([
        "h-4",
        "w-6",
        "bg-switch-thumb",
        "data-checked:bg-switch-thumb-checked",
        "data-checked:translate-x-4",
      ]),
    );
  });
});

describe("Alert", () => {
  const alert = (variant?: "default" | "success" | "warning" | "info" | "destructive") =>
    renderToStaticMarkup(
      <Alert variant={variant}>
        <svg />
        <AlertTitle>Pushed to origin</AlertTitle>
        <AlertDescription>3 commits.</AlertDescription>
      </Alert>,
    );

  it("is an alert region on the card surface with a 16px radius-2xl corner", () => {
    const markup = alert();
    expect(markup).toContain('role="alert"');
    for (const name of [
      "rounded-2xl",
      "border",
      "border-border",
      "bg-card",
      "text-card-foreground",
      "px-4",
      "py-3",
      "text-sm",
    ]) {
      expect(classes(markup)).toContain(name);
    }
  });

  it("reserves the icon column only when an icon is present", () => {
    expect(classes(alert())).toEqual(
      expect.arrayContaining(["grid-cols-[0_1fr]", "has-[>svg]:grid-cols-[auto_1fr]", "has-[>svg]:gap-x-2.5"]),
    );
  });

  it.each([
    ["success", "bg-success-muted", "text-success"],
    ["warning", "bg-warning-muted", "text-warning"],
    ["info", "bg-info-muted", "text-info"],
  ] as const)("tints the %s variant and keeps the description in foreground", (variant, fill, text) => {
    const present = classes(alert(variant));
    expect(present).toEqual(
      expect.arrayContaining([fill, text, "border-transparent", "[&_[data-slot=alert-description]]:text-foreground"]),
    );
    // The default surface and border are replaced, not stacked on.
    expect(present).not.toContain("bg-card");
    expect(present).not.toContain("border-border");
  });

  it("colours the destructive variant's title and description", () => {
    const present = classes(alert("destructive"));
    expect(present).toEqual(
      expect.arrayContaining(["text-destructive", "[&_[data-slot=alert-description]]:text-destructive"]),
    );
    expect(present).not.toContain("text-card-foreground");
  });

  it("places the title and description in the second column", () => {
    const markup = alert();
    expect(classes(markup.slice(markup.indexOf('data-slot="alert-title"') - 40), "div")).toEqual(
      expect.arrayContaining(["col-start-2", "font-medium"]),
    );
    expect(markup).toContain("text-muted-foreground");
  });
});

describe("Tabs", () => {
  const markup = renderToStaticMarkup(
    <Tabs defaultValue="changes">
      <TabsList>
        <TabsTrigger value="changes">Changes</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="changes">4 changed files</TabsContent>
    </Tabs>,
  );

  it("renders a tablist with tabs and the selected panel", () => {
    expect(markup).toContain('role="tablist"');
    expect(markup.match(/role="tab"/g)).toHaveLength(2);
    expect(markup).toContain('role="tabpanel"');
    expect(markup).toContain("4 changed files");
  });

  it("is a muted pill track 36px tall with 4px padding", () => {
    for (const name of [
      "h-(--control-md)",
      "rounded-full",
      "bg-muted",
      "p-1",
      "text-muted-foreground",
      "inline-flex",
    ]) {
      expect(slotClasses(markup, "tabs-list")).toContain(name);
    }
  });

  it("raises the active tab onto tab-active; Base UI marks it `data-active`", () => {
    const tab = slotClasses(markup, "tabs-trigger");
    for (const name of [
      "rounded-full",
      "px-3",
      "font-medium",
      "text-tab-foreground",
      "hover:text-foreground",
      "data-active:bg-tab-active",
      "data-active:text-foreground",
      "data-active:shadow-(--shadow-xs)",
    ]) {
      expect(tab).toContain(name);
    }
    expect(markup).toContain("data-active");
  });
});

describe("Article", () => {
  const markup = renderToStaticMarkup(
    <Article>
      <ArticleEyebrow>Release notes · 2026-10-07</ArticleEyebrow>
      <h1>Notes on rebasing</h1>
    </Article>,
  );

  it("is a 640px-text serif column (688px with padding) with 24px side and 32px vertical padding", () => {
    expect(markup).toMatch(/^<article /);
    for (const name of ["max-w-172", "px-6", "py-8", "font-serif", "text-foreground"]) {
      expect(classes(markup)).toContain(name);
    }
  });

  it("sets headings in the heading family and paragraphs at 17/28", () => {
    const present = classes(markup);
    expect(present).toEqual(
      expect.arrayContaining([
        "[&_h1]:font-heading",
        "[&_h1]:text-[30px]/9",
        "[&_h1]:tracking-[-0.02em]",
        "[&_h2]:text-2xl/8",
        "[&_h2]:tracking-[-0.01em]",
        "[&_p]:text-[17px]/7",
        "[&_blockquote]:border-l-2",
        "[&_blockquote]:italic",
        "[&_code]:bg-muted",
        "[&_code]:text-[14px]",
        "[&_code]:font-mono",
      ]),
    );
  });

  it("has a small sans eyebrow", () => {
    const eyebrow = classes(markup.slice(markup.indexOf('data-slot="article-eyebrow"') - 40), "div");
    expect(eyebrow).toEqual(expect.arrayContaining(["font-sans", "text-xs/4", "font-medium", "text-muted-foreground"]));
  });
});
