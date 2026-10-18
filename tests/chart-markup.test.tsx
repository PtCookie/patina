// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { describe, expect, it } from "vitest";
import { ChartContainer, type ChartConfig } from "../registry/ui/chart";

const config = { commits: { label: "Commits", color: "var(--chart-3)" } } satisfies ChartConfig;

// ChartContainer styles Recharts' own markup through class selectors, and Recharts renames those classes between
// releases (the tick text moved out of `.recharts-cartesian-axis-tick` in 3.x, which silently left ticks in
// Recharts' default grey). Draw a real chart at a fixed size and check that every selector that applies without
// interaction still matches an element.
const container = renderToStaticMarkup(<ChartContainer config={config}>{null}</ChartContainer>)
  .replace(/&amp;/g, "&")
  .replace(/&gt;/g, ">")
  .replace(/&#x27;/g, "'");
const classes = (/class="([^"]*)"/.exec(container)?.[1] ?? "").split(/\s+/);
// Hover and tooltip states, polar and radial charts and line-chart parts have no markup in a bar chart.
const notInABarChart = /hover|tooltip-cursor|radial|polar|reference|sector|curve|dot|layer|surface/;
const selectors = classes
  .filter((name) => name.startsWith("[&_"))
  .map((name) => name.slice(3, name.lastIndexOf("]:")).replaceAll("_", " "))
  .filter((selector) => !notInABarChart.test(selector));

describe("ChartContainer selectors", () => {
  it("covers the axes, ticks and grid", () => {
    expect(selectors).toEqual(
      expect.arrayContaining([
        ".recharts-cartesian-axis-line",
        ".recharts-cartesian-axis-tick-line",
        ".recharts-cartesian-axis-tick-value",
        ".recharts-cartesian-grid line[stroke='#ccc']",
      ]),
    );
  });

  it("matches every one of them in a rendered chart", () => {
    const { container: root } = render(
      <BarChart width={400} height={200} data={[{ week: "Sep 15", commits: 22 }]}>
        <CartesianGrid />
        <XAxis dataKey="week" />
        <YAxis />
        <Bar dataKey="commits" fill="var(--color-commits)" />
      </BarChart>,
    );
    for (const selector of selectors) {
      expect(root.querySelectorAll(selector).length, `no element matches ${selector}`).toBeGreaterThan(0);
    }
  });
});
