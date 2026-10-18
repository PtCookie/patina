# Chart

Recharts-based charts (shadcn `chart`) on the teal ramp `chart-1`…`chart-5`, with recessive axes and a hover tooltip.

**Consumer provides:** the data, a `ChartConfig` naming each series and its color token, a title (`heading-md`) and a one-line subtitle in `muted-foreground`.

- **The ramp is sequential, not categorical.** Use it for one series or for ordered values (light = less, dark = more). It fails as a categorical palette (adjacent steps are too close), so never give unrelated series different `chart-*` steps — split them into small multiples or label every series directly.
- One series: bars and lines in `chart-3` (≥3:1 on `background`), `chart-4` on hover. Bars 60% of the band, 4px rounded tops anchored to the baseline; lines 2px.
- Grid and axis lines in `border`, tick labels 12px `muted-foreground` with tabular figures; no y-axis line, no gridline at zero other than the axis.
- Tooltip on every chart: `popover` surface, `radius-md`, `shadow-menu`, 12px text, value in `mono`; hit areas cover the whole band, not just the bar.
- Status colors never color data series. One y-axis per chart.
