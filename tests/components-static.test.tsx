import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../registry/ui/checkbox.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../registry/ui/collapsible.tsx";
import { Label } from "../registry/ui/label.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../registry/ui/pagination.tsx";
import { Separator } from "../registry/ui/separator.tsx";
import { Skeleton } from "../registry/ui/skeleton.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../registry/ui/table.tsx";
import { Toggle } from "../registry/ui/toggle.tsx";
import { ToggleGroup, ToggleGroupItem } from "../registry/ui/toggle-group.tsx";

/** The class list of the first element (or the n-th, counting `<` tags) in rendered markup. */
function classes(markup: string, tag?: string): string[] {
  const pattern = tag ? new RegExp(`<${tag}\\b[^>]*class="([^"]*)"`) : /class="([^"]*)"/;
  const raw = (pattern.exec(markup)?.[1] ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"');
  return raw.split(/\s+/).filter(Boolean);
}

const render = (element: React.ReactElement, tag?: string): string[] => classes(renderToStaticMarkup(element), tag);

describe("Label", () => {
  it("is 14px medium at line-height 1 in the foreground colour, and dims with a disabled control", () => {
    const markup = renderToStaticMarkup(<Label htmlFor="name">Issuer</Label>);
    expect(markup).toMatch(/^<label /);
    expect(markup).toContain('for="name"');
    const present = classes(markup);
    for (const name of [
      "text-sm",
      "leading-none",
      "font-medium",
      "text-foreground",
      "gap-2",
      "peer-disabled:opacity-50",
      "peer-disabled:cursor-not-allowed",
      "group-data-[disabled=true]:opacity-50",
    ]) {
      expect(present).toContain(name);
    }
  });
});

describe("Separator", () => {
  it("is a 1px border hairline in both orientations", () => {
    const horizontal = renderToStaticMarkup(<Separator />);
    expect(horizontal).toContain('role="separator"');
    // Base UI marks the orientation as `data-orientation`; a variant on any other attribute never applies.
    expect(horizontal).toContain('data-orientation="horizontal"');
    for (const name of [
      "bg-border",
      "shrink-0",
      "data-[orientation=horizontal]:h-px",
      "data-[orientation=horizontal]:w-full",
    ]) {
      expect(classes(horizontal)).toContain(name);
    }
    const vertical = renderToStaticMarkup(<Separator orientation="vertical" />);
    expect(vertical).toContain('aria-orientation="vertical"');
    expect(vertical).toContain('data-orientation="vertical"');
    for (const name of ["data-[orientation=vertical]:w-px", "data-[orientation=vertical]:self-stretch"]) {
      expect(classes(vertical)).toContain(name);
    }
  });
});

describe("Skeleton", () => {
  it("is a muted pulsing placeholder that stops under reduced motion", () => {
    const present = render(<Skeleton />);
    for (const name of ["animate-pulse", "bg-muted", "motion-reduce:animate-none", "rounded-md"]) {
      expect(present).toContain(name);
    }
  });

  it.each([
    ["default", "rounded-md"],
    ["block", "rounded-lg"],
    ["circle", "rounded-full"],
  ] as const)("shape %s has exactly one radius: %s", (shape, radius) => {
    const radii = render(<Skeleton shape={shape} />).filter((name) => name.startsWith("rounded-"));
    expect(radii).toEqual([radius]);
  });

  it("takes its size from the caller", () => {
    expect(render(<Skeleton className="h-3.5 w-48" />)).toEqual(expect.arrayContaining(["h-3.5", "w-48"]));
  });
});

describe("Table", () => {
  const table = (
    <Table containerClassName="max-h-64">
      <TableCaption>Commits</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Commit</TableHead>
          <TableHead numeric>Files</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell mono>a3f9c21</TableCell>
          <TableCell numeric>12</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
  const markup = renderToStaticMarkup(table);

  it("wraps the table in a scroll container that takes its own class", () => {
    expect(markup).toMatch(/^<div data-slot="table-container" data-testid="table-container" class="[^"]*max-h-64/);
    expect(classes(markup)).toEqual(expect.arrayContaining(["relative", "w-full", "overflow-x-auto"]));
    expect(classes(markup, "table")).toEqual(expect.arrayContaining(["w-full", "text-sm"]));
  });

  it("uses the table-head height and the body padding", () => {
    expect(classes(markup, "th")).toEqual(
      expect.arrayContaining(["h-(--table-head)", "px-3", "font-medium", "text-foreground", "whitespace-nowrap"]),
    );
    expect(classes(markup, "td")).toEqual(expect.arrayContaining(["p-3", "align-middle", "whitespace-nowrap"]));
  });

  it("rules rows with the border colour and fills hover and selected with muted tints", () => {
    expect(classes(markup, "tr")).toEqual(
      expect.arrayContaining([
        "border-b",
        "border-border",
        "hover:bg-muted-hover",
        "data-[state=selected]:bg-muted",
        "transition-colors",
      ]),
    );
    expect(markup).toContain('data-state="selected"');
    expect(classes(markup, "tbody")).toContain("[&_tr:last-child]:border-0");
  });

  it("aligns numeric columns right with tabular figures and sets identifiers in mono", () => {
    const head = (numeric: boolean) => render(<TableHead numeric={numeric}>Files</TableHead>, "th");
    expect(head(true)).toEqual(expect.arrayContaining(["text-right", "tabular-nums"]));
    expect(head(true)).not.toContain("text-left");
    expect(head(false)).toContain("text-left");
    expect(head(false)).not.toContain("text-right");
    expect(render(<TableCell numeric>12</TableCell>, "td")).toEqual(
      expect.arrayContaining(["text-right", "tabular-nums"]),
    );
    expect(render(<TableCell mono>a3f9c21</TableCell>, "td")).toEqual(
      expect.arrayContaining(["font-mono", "text-[13px]/5"]),
    );
    expect(render(<TableCell>plain</TableCell>, "td")).not.toContain("font-mono");
  });

  it("has a quiet footer and caption", () => {
    expect(classes(markup, "tfoot")).toEqual(expect.arrayContaining(["border-t", "border-border", "bg-muted-hover"]));
    expect(classes(markup, "caption")).toEqual(expect.arrayContaining(["text-sm", "text-muted-foreground"]));
  });
});

describe("Checkbox", () => {
  it("is a 16px square on the control-strong fill", () => {
    const markup = renderToStaticMarkup(<Checkbox aria-label="Sign commits" />);
    expect(markup).toContain('data-slot="checkbox"');
    expect(markup).toContain('role="checkbox"');
    expect(markup).toContain('aria-checked="false"');
    const present = classes(markup);
    for (const name of [
      "size-4",
      "rounded-sm",
      "border-transparent",
      "bg-control-strong",
      "text-primary-foreground",
      "data-checked:bg-primary",
      "data-checked:border-primary",
      "focus-visible:outline-2",
      "focus-visible:outline-ring",
      "disabled:opacity-50",
      "aria-invalid:ring-invalid-ring",
    ]) {
      expect(present).toContain(name);
    }
  });

  it("renders checked and disabled state", () => {
    const markup = renderToStaticMarkup(<Checkbox defaultChecked disabled aria-label="Force push" />);
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain("data-checked");
    expect(markup).toContain("data-disabled");
    // The check mark is the Phosphor icon.
    expect(markup).toMatch(/<svg[^>]*viewBox="0 0 256 256"/);
  });
});

describe("Toggle", () => {
  it("is off transparent with muted content and on filled with muted", () => {
    const markup = renderToStaticMarkup(<Toggle aria-label="Bold">B</Toggle>);
    expect(markup).toContain('data-slot="toggle"');
    expect(markup).toContain('aria-pressed="false"');
    const present = classes(markup);
    for (const name of [
      "border-transparent",
      "bg-transparent",
      "text-muted-foreground",
      "hover:bg-muted-hover",
      "hover:text-foreground",
      "aria-pressed:bg-muted",
      "aria-pressed:text-foreground",
      "rounded-lg",
      "h-(--control-md)",
      "min-w-(--control-md)",
      "gap-2",
    ]) {
      expect(present).toContain(name);
    }
  });

  it.each([
    ["default", ["h-(--control-md)", "min-w-(--control-md)", "px-3"]],
    ["sm", ["h-(--control-sm)", "min-w-(--control-sm)", "px-3"]],
    ["lg", ["h-(--control-lg)", "min-w-(--control-lg)", "px-4"]],
  ] as const)("size %s", (size, expected) => {
    for (const name of expected) expect(render(<Toggle size={size}>T</Toggle>)).toContain(name);
  });

  it("has an outline variant with the input hairline", () => {
    const present = render(<Toggle variant="outline">T</Toggle>);
    expect(present).toContain("border-input");
    expect(present).not.toContain("border-transparent");
  });

  it("reflects the pressed state", () => {
    expect(renderToStaticMarkup(<Toggle defaultPressed>T</Toggle>)).toContain('aria-pressed="true"');
  });
});

describe("ToggleGroup", () => {
  const group = (
    <ToggleGroup defaultValue={["3M"]} aria-label="Period">
      <ToggleGroupItem value="1M">1M</ToggleGroupItem>
      <ToggleGroupItem value="3M">3M</ToggleGroupItem>
      <ToggleGroupItem value="1Y">1Y</ToggleGroupItem>
    </ToggleGroup>
  );
  const markup = renderToStaticMarkup(group);

  it("is an inline row of joined items", () => {
    expect(markup).toContain('data-slot="toggle-group"');
    expect(markup).toContain('data-variant="outline"');
    expect(classes(markup)).toEqual(expect.arrayContaining(["inline-flex", "flex-row"]));
    expect(markup.match(/data-slot="toggle-group-item"/g)).toHaveLength(3);
  });

  it("gives every item the outline hairline and only the outer corners a radius", () => {
    const item = classes(markup, "button");
    for (const name of [
      "border-input",
      "rounded-none",
      "first:rounded-l-lg",
      "last:rounded-r-lg",
      "not-first:-ml-px",
      "focus-visible:z-10",
    ]) {
      expect(item).toContain(name);
    }
    expect(item).not.toContain("rounded-lg");
    expect(item).not.toContain("border-transparent");
  });

  it("marks the selected item pressed", () => {
    expect(markup.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(markup).toMatch(/aria-pressed="true"[^>]*>3M|>3M<[^>]*|3M/);
  });

  it("passes the size to the items", () => {
    const small = renderToStaticMarkup(
      <ToggleGroup size="sm" aria-label="Size">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(classes(small, "button")).toEqual(expect.arrayContaining(["h-(--control-sm)", "min-w-(--control-sm)"]));
  });
});

describe("Collapsible", () => {
  it("renders the trigger with the caret rotation classes and no closed panel", () => {
    const markup = renderToStaticMarkup(
      <Collapsible>
        <CollapsibleTrigger aria-label="Toggle pinned searches">v</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(markup).toContain('data-slot="collapsible"');
    expect(markup).toContain('data-slot="collapsible-trigger"');
    expect(markup).toContain('aria-expanded="false"');
    expect(classes(markup, "button")).toEqual(
      expect.arrayContaining([
        "[&>svg]:transition-transform",
        "[&>svg]:duration-150",
        "[&>svg]:ease-out",
        "data-panel-open:[&>svg]:rotate-180",
      ]),
    );
    // A closed panel is not rendered until it opens.
    expect(markup).not.toContain("Content");
  });

  it("opens by default when asked", () => {
    const markup = renderToStaticMarkup(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>T</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain("data-panel-open");
    expect(markup).toContain("Content");
  });
});

describe("Pagination", () => {
  const markup = renderToStaticMarkup(
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#3" aria-disabled="true" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  );

  it("is a navigation landmark with real links", () => {
    expect(markup).toMatch(/^<nav /);
    expect(markup).toContain('aria-label="Pagination"');
    expect(markup).toContain('href="#2"');
    expect(markup.match(/<a /g)).toHaveLength(4);
    expect(classes(markup, "ul")).toEqual(expect.arrayContaining(["flex", "items-center", "gap-1"]));
  });

  it("styles every link as a ghost 36px square and outlines the current page", () => {
    // A page-number link (the first `<a>` in the list is Previous, which pads asymmetrically).
    const plain = render(<PaginationLink href="#1">1</PaginationLink>, "a");
    for (const name of [
      "h-(--control-md)",
      "min-w-(--control-md)",
      "rounded-lg",
      "border-transparent",
      "px-2.5",
      "font-medium",
      "tabular-nums",
      "hover:bg-muted",
      "aria-[current=page]:border-border",
      "aria-[current=page]:bg-background",
      "aria-disabled:opacity-50",
    ]) {
      expect(plain).toContain(name);
    }
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it("gives Previous and Next an asymmetric padding, text and a caret", () => {
    const previous = /<a [^>]*aria-label="Go to previous page"[^>]*>(.*?)<\/a>/.exec(markup);
    expect(previous?.[1]).toContain("Previous");
    expect(previous?.[1]).toContain("<svg");
    const link =
      /<a [^>]*class="([^"]*)"[^>]*aria-label="Go to previous page"|aria-label="Go to previous page"[^>]*class="([^"]*)"/.exec(
        markup,
      );
    const previousClasses = (link?.[1] ?? link?.[2] ?? "").split(/\s+/);
    expect(previousClasses).toEqual(expect.arrayContaining(["pl-2", "pr-2.5"]));
    expect(previousClasses).not.toContain("px-2.5");
    const next = /<a [^>]*aria-label="Go to next page"[^>]*>/.exec(markup)?.[0] ?? "";
    expect(next).toContain('aria-disabled="true"');
    expect(next).toMatch(/\bpr-2\b/);
    expect(next).toMatch(/\bpl-2\.5\b/);
  });

  it("hides the ellipsis from assistive technology but names it for screen readers", () => {
    expect(markup).toContain('data-slot="pagination-ellipsis"');
    expect(markup).toMatch(
      /data-slot="pagination-ellipsis"[^>]*aria-hidden|aria-hidden="true"[^>]*data-slot="pagination-ellipsis"/,
    );
    expect(markup).toContain("More pages");
    expect(markup).toMatch(
      /pointer-events-none[^"]*text-muted-foreground|text-muted-foreground[^"]*pointer-events-none/,
    );
  });
});
