import { readdirSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { COMPONENTS } from "../src/components";
import { Badge } from "../registry/ui/badge";
import { Button } from "../registry/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../registry/ui/card";
import { Input } from "../registry/ui/input";

/** The class list of the first element in rendered markup. */
function classes(markup: string): string[] {
  return (/class="([^"]*)"/.exec(markup)?.[1] ?? "").split(/\s+/).filter(Boolean);
}

const render = (element: React.ReactElement): string[] => classes(renderToStaticMarkup(element));

describe("Button", () => {
  const variants = {
    default: ["border-transparent", "bg-primary", "text-primary-foreground", "hover:bg-primary-hover"],
    outline: ["border-border", "bg-outline-fill", "text-foreground", "hover:bg-outline-hover"],
    secondary: ["border-transparent", "bg-secondary", "text-secondary-foreground", "hover:bg-secondary-hover"],
    ghost: ["border-transparent", "bg-transparent", "text-foreground", "hover:bg-ghost-hover"],
    destructive: ["border-transparent", "bg-destructive-muted", "text-destructive", "hover:bg-destructive-muted-hover"],
    link: ["border-transparent", "bg-transparent", "text-link", "hover:underline"],
  } as const;

  it.each(Object.entries(variants))("%s uses its own tokens", (variant, expected) => {
    const present = render(<Button variant={variant as keyof typeof variants}>Label</Button>);
    for (const name of expected) expect(present).toContain(name);
  });

  it("renders a button with the slot attribute and the shared behaviour classes", () => {
    const markup = renderToStaticMarkup(<Button>Label</Button>);
    expect(markup).toContain('data-slot="button"');
    expect(markup).toContain('type="button"');
    const present = classes(markup);
    for (const name of [
      "cursor-pointer",
      "rounded-lg",
      "h-(--control-md)",
      "px-3",
      "gap-1.5",
      "text-sm",
      "transition-colors",
      "duration-150",
      "disabled:opacity-50",
      "focus-visible:outline-2",
      "focus-visible:outline-offset-2",
      "focus-visible:outline-ring",
    ]) {
      expect(present).toContain(name);
    }
  });

  it.each([
    ["xs", ["h-(--control-xs)", "px-2.5", "gap-1", "text-xs"]],
    ["sm", ["h-(--control-sm)", "px-3", "gap-1", "text-sm"]],
    ["default", ["h-(--control-md)", "px-3", "gap-1.5", "text-sm"]],
    ["lg", ["h-(--control-lg)", "px-4", "gap-1.5", "text-sm"]],
    ["icon", ["size-(--control-md)", "text-sm"]],
    ["icon-xs", ["size-(--control-xs)", "text-xs"]],
    ["icon-sm", ["size-(--control-sm)", "text-sm"]],
    ["icon-lg", ["size-(--control-lg)", "text-sm"]],
  ] as const)("size %s", (size, expected) => {
    const present = render(<Button size={size}>Label</Button>);
    for (const name of expected) expect(present).toContain(name);
  });

  it("switches to the pill shape without keeping the default radius", () => {
    const pill = render(<Button shape="pill">Label</Button>);
    expect(pill).toContain("rounded-full");
    expect(pill).not.toContain("rounded-lg");
    const square = render(<Button>Label</Button>);
    expect(square).toContain("rounded-lg");
    expect(square).not.toContain("rounded-full");
  });

  it("sets every conflicting class group in exactly one place, for every combination", () => {
    const names = Object.keys(variants) as (keyof typeof variants)[];
    const sizes = ["xs", "sm", "default", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"] as const;
    for (const variant of names) {
      for (const size of sizes) {
        for (const shape of ["default", "pill"] as const) {
          const present = render(
            <Button variant={variant} size={size} shape={shape}>
              Label
            </Button>,
          );
          const label = `${variant}/${size}/${shape}`;
          const count = (pattern: RegExp) => present.filter((name) => pattern.test(name)).length;
          expect({ label, radius: count(/^rounded-/) }).toEqual({ label, radius: 1 });
          expect({ label, border: count(/^border-/) }).toEqual({ label, border: 1 });
          expect({ label, text: count(/^text-(xs|sm)$/) }).toEqual({ label, text: 1 });
          expect({ label, background: count(/^bg-(?!clip)/) }).toEqual({ label, background: 1 });
        }
      }
    }
  });

  it("passes through props and merges a custom class", () => {
    const markup = renderToStaticMarkup(
      <Button disabled aria-label="Settings" className="extra">
        S
      </Button>,
    );
    expect(markup).toContain("disabled");
    expect(markup).toContain('aria-label="Settings"');
    expect(classes(markup)).toContain("extra");
  });
});

describe("Badge", () => {
  const variants = {
    default: ["border-transparent", "bg-primary", "text-primary-foreground"],
    secondary: ["border-transparent", "bg-secondary", "text-secondary-foreground"],
    outline: ["border-border", "text-foreground"],
    destructive: ["border-transparent", "bg-destructive-muted", "text-destructive"],
    success: ["border-transparent", "bg-success-muted", "text-success"],
    warning: ["border-transparent", "bg-warning-muted", "text-warning"],
    info: ["border-transparent", "bg-info-muted", "text-info"],
  } as const;

  it.each(Object.entries(variants))("%s uses its own tokens", (variant, expected) => {
    const present = render(<Badge variant={variant as keyof typeof variants}>Label</Badge>);
    for (const name of expected) expect(present).toContain(name);
    for (const name of ["h-5", "rounded-full", "px-2", "py-0.5", "gap-1", "text-xs", "font-medium"]) {
      expect(present).toContain(name);
    }
  });

  it("is a span by default and can render as another element", () => {
    expect(renderToStaticMarkup(<Badge>Label</Badge>)).toMatch(/^<span /);
    expect(renderToStaticMarkup(<Badge render={<a href="/branches" />}>Label</Badge>)).toMatch(/^<a /);
  });

  it("marks status badges as tints: no solid status fill", () => {
    for (const variant of ["success", "warning", "info", "destructive"] as const) {
      const present = render(<Badge variant={variant}>Label</Badge>);
      expect(present.some((name) => /^bg-(success|warning|info|destructive)$/.test(name))).toBe(false);
    }
  });
});

describe("Input", () => {
  it("is a borderless field on the control fill", () => {
    const markup = renderToStaticMarkup(<Input placeholder="Branch name" />);
    expect(markup).toContain('data-slot="input"');
    expect(markup).toContain('placeholder="Branch name"');
    const present = classes(markup);
    for (const name of [
      "h-(--control-md)",
      "w-full",
      "rounded-lg",
      "border-transparent",
      "bg-control",
      "px-3",
      "py-1",
      "text-base",
      "md:text-sm",
      "text-foreground",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-2",
      "focus-visible:outline-ring",
      "disabled:opacity-50",
      "aria-invalid:border-invalid-border",
      "aria-invalid:ring-3",
      "aria-invalid:ring-invalid-ring",
    ]) {
      expect(present).toContain(name);
    }
  });

  it("has an opt-in pill shape that replaces the default radius", () => {
    const pill = render(<Input shape="pill" />);
    expect(pill).toContain("rounded-full");
    expect(pill).not.toContain("rounded-lg");
  });

  it("passes the type and aria attributes through", () => {
    const markup = renderToStaticMarkup(<Input type="search" aria-invalid="true" />);
    expect(markup).toContain('type="search"');
    expect(markup).toContain('aria-invalid="true"');
  });
});

describe("Card", () => {
  it("is a card surface with a ring shadow instead of a border", () => {
    const markup = renderToStaticMarkup(<Card>Content</Card>);
    expect(markup).toContain('data-slot="card"');
    expect(markup).toContain('data-size="default"');
    const present = classes(markup);
    for (const name of [
      "rounded-3xl",
      "bg-card",
      "text-card-foreground",
      "shadow-(--shadow-card)",
      "gap-(--card-spacing)",
      "py-(--card-spacing)",
      "[--card-spacing:--spacing(6)]",
      "data-[size=sm]:[--card-spacing:--spacing(4)]",
    ]) {
      expect(present).toContain(name);
    }
    expect(present).not.toContain("border");
  });

  it("is interactive only on request", () => {
    const hover = ["cursor-pointer", "hover:shadow-(--shadow-card-hover)"];
    const plain = render(<Card>Content</Card>);
    for (const name of hover) expect(plain).not.toContain(name);
    const interactive = render(<Card interactive>Content</Card>);
    for (const name of hover) expect(interactive).toContain(name);
  });

  it("has a small size", () => {
    expect(renderToStaticMarkup(<Card size="sm">Content</Card>)).toContain('data-size="sm"');
  });

  it("builds a card from its parts", () => {
    const markup = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    for (const slot of [
      "card-header",
      "card-title",
      "card-description",
      "card-action",
      "card-content",
      "card-footer",
    ]) {
      expect(markup).toContain(`data-slot="${slot}"`);
    }
    expect(render(<CardTitle>Title</CardTitle>)).toEqual(
      expect.arrayContaining(["font-heading", "text-base", "font-medium"]),
    );
    expect(render(<CardDescription>Text</CardDescription>)).toEqual(
      expect.arrayContaining(["text-sm", "text-muted-foreground"]),
    );
    expect(render(<CardFooter>Footer</CardFooter>)).toEqual(expect.arrayContaining(["flex", "justify-end", "gap-2"]));
    expect(render(<CardHeader>Header</CardHeader>)).toEqual(expect.arrayContaining(["grid", "gap-1.5"]));
  });
});

describe("registry sources follow the colour rules", () => {
  // Colours are used by semantic token name only; components never compute state colours.
  const dir = new URL("../registry/ui/", import.meta.url);
  const sources = readdirSync(dir)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => ({ name, text: readFileSync(new URL(name, dir), "utf8") }));

  it("finds the component sources", () => {
    // Every source is registered in COMPONENTS and the other way round (the build also checks the second half).
    expect(sources.map((source) => source.name)).toEqual(
      COMPONENTS.map((spec) => spec.file.replace("registry/ui/", "")).sort(),
    );
  });

  const forbidden: [string, RegExp][] = [
    ["color-mix()", /color-mix/],
    [
      "opacity modifier on a colour (bg-primary/80)",
      // `text-xs/4` is a font size with a line height, not a colour with an opacity.
      /\b(?:bg|text|border|ring|outline|shadow|fill|stroke|from|via|to)-(?!(?:xs|sm|base|lg|xl|\dxl)\/)[a-z][a-z0-9-]*\/\d+/,
    ],
    [
      "Tailwind palette class",
      /\b(?:bg|text|border|ring|outline|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
    ],
    ["arbitrary colour value", /-\[(?:#|oklch|rgb|hsl)/],
    ["colour literal", /#[0-9a-fA-F]{3,8}\b|oklch\(|rgba?\(|hsla?\(/],
    ["dark: colour override", /\bdark:(?:bg|text|border|ring|outline|fill|stroke)-/],
  ];

  it.each(forbidden)("contain no %s", (_label, pattern) => {
    // The chart's selectors for recharts' own default attributes (`[stroke='#ccc']`) are not colour usage.
    const offenders = sources
      .filter((source) => pattern.test(source.text.replace(/\[stroke='#(?:ccc|fff)'\]/g, "")))
      .map((source) => source.name);
    expect(offenders).toEqual([]);
  });
});
