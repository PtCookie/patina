import { renderToStaticMarkup } from "react-dom/server";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { describe, expect, it } from "vitest";
import {
  chartBarRadius,
  chartRamp,
  chartSeries,
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../registry/ui/chart";

const config = { commits: { label: "Commits", color: chartSeries.color } } satisfies ChartConfig;

const unescape = (markup: string): string =>
  markup
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

const classesOf = (markup: string, selector: RegExp): string[] =>
  (selector.exec(unescape(markup))?.[1] ?? "").split(/\s+/).filter(Boolean);

describe("chart constants", () => {
  it("is the sequential teal ramp, lightest to darkest", () => {
    expect(chartRamp).toEqual([
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ]);
  });

  it("colours a single series chart-3 and its hover chart-4", () => {
    expect(chartSeries).toEqual({ color: "var(--chart-3)", hover: "var(--chart-4)" });
  });

  it("rounds only the tops of bars, 4px", () => {
    expect(chartBarRadius).toEqual([4, 4, 0, 0]);
  });
});

describe("ChartContainer", () => {
  const markup = renderToStaticMarkup(
    <ChartContainer config={config} id="week" className="h-48">
      <BarChart data={[{ week: "Sep 15", commits: 22 }]}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="commits" fill="var(--color-commits)" radius={chartBarRadius} />
      </BarChart>
    </ChartContainer>,
  );
  const present = classesOf(markup, /data-slot="chart"[^>]*class="([^"]*)"|class="([^"]*)"[^>]*data-slot="chart"/);

  it("renders a chart region with the caller's class and 12px text", () => {
    expect(markup).toContain('data-slot="chart"');
    expect(markup).toContain('data-chart="chart-week"');
    expect(present).toEqual(expect.arrayContaining(["flex", "aspect-video", "text-xs", "h-48"]));
  });

  it("paints axes and grid in the border colour and ticks muted with tabular figures", () => {
    for (const name of [
      "[&_.recharts-cartesian-axis-line]:stroke-border",
      "[&_.recharts-cartesian-axis-tick-line]:stroke-border",
      "[&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground",
      "[&_.recharts-cartesian-axis-tick-value]:tabular-nums",
      "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border",
    ]) {
      expect(present).toContain(name);
    }
  });

  it("turns a hovered bar chart-4 and leaves the tooltip cursor band out", () => {
    expect(present).toContain("[&_.recharts-bar-rectangle:hover_.recharts-rectangle]:fill-chart-4");
    expect(present).toContain("[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-transparent");
  });

  it("does not use an opacity modifier on the grid", () => {
    expect(present.some((name) => /stroke-border\/\d+/.test(name))).toBe(false);
  });
});

describe("ChartStyle", () => {
  it("exposes each series colour as a variable, per theme", () => {
    const css = renderToStaticMarkup(
      <ChartStyle
        id="chart-week"
        config={{
          commits: { label: "Commits", color: "var(--chart-3)" },
          views: { label: "Views", theme: { light: "var(--chart-2)", dark: "var(--chart-4)" } },
        }}
      />,
    );
    const text = unescape(css);
    expect(text).toContain("[data-chart=chart-week]");
    expect(text).toContain("--color-commits: var(--chart-3);");
    expect(text).toContain("--color-views: var(--chart-2);");
    expect(text).toContain(".dark [data-chart=chart-week]");
    expect(text).toContain("--color-views: var(--chart-4);");
  });

  it("renders nothing for a config without colours", () => {
    expect(renderToStaticMarkup(<ChartStyle id="x" config={{ a: { label: "A" } }} />)).toBe("");
  });
});

describe("ChartTooltipContent", () => {
  const payload = [
    {
      graphicalItemId: "bar-commits",
      name: "commits",
      dataKey: "commits",
      value: 22,
      color: "var(--chart-3)",
      payload: { week: "Sep 15", commits: 22, fill: "var(--chart-3)" },
    },
  ];
  const tooltip = renderToStaticMarkup(
    <ChartContainer config={config}>
      <ChartTooltipContent active payload={payload} label="Week of Sep 15" />
    </ChartContainer>,
  );

  it("is a popover surface with radius-md, shadow-menu and 12px text", () => {
    const surface = classesOf(tooltip, /<div class="((?:grid items-start)[^"]*)"/);
    for (const name of [
      "grid",
      "gap-1.5",
      "rounded-md",
      "bg-popover",
      "text-popover-foreground",
      "text-xs",
      "px-2.5",
      "py-1.5",
      "shadow-(--shadow-menu)",
    ]) {
      expect(surface).toContain(name);
    }
    expect(surface).not.toContain("rounded-xl");
    expect(surface.some((name) => name.startsWith("ring"))).toBe(false);
  });

  it("shows the label, the series name and the value in mono", () => {
    expect(tooltip).toContain("Week of Sep 15");
    expect(tooltip).toContain("Commits");
    const value = classesOf(tooltip, /<span class="(font-mono[^"]*)">22<\/span>/);
    expect(value).toEqual(expect.arrayContaining(["font-mono", "font-medium", "tabular-nums"]));
  });

  it("marks the series with an 8px square in its colour", () => {
    const key = /<div class="([^"]*bg-\(--color-bg\)[^"]*)" style="([^"]*)"/.exec(unescape(tooltip));
    expect(key?.[1]?.split(/\s+/)).toEqual(expect.arrayContaining(["size-2", "rounded-xs", "shrink-0"]));
    expect(key?.[2]).toContain("--color-bg:var(--chart-3)");
  });

  it("renders nothing when inactive", () => {
    const inactive = renderToStaticMarkup(
      <ChartContainer config={config}>
        <ChartTooltipContent active={false} payload={payload} />
      </ChartContainer>,
    );
    expect(inactive).not.toContain("Commits");
  });
});

describe("ChartLegendContent", () => {
  it("lists each series with a small square and its label", () => {
    const legend = renderToStaticMarkup(
      <ChartContainer config={config}>
        <ChartLegendContent
          payload={[{ value: "commits", dataKey: "commits", color: "var(--chart-3)", type: "square" }]}
        />
      </ChartContainer>,
    );
    expect(legend).toContain("Commits");
    expect(legend).toMatch(/size-2/);
    expect(legend).toMatch(/background-color:var\(--chart-3\)/);
  });
});
