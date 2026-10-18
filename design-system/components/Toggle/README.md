# Toggle

A two-state button: off is transparent with `muted-foreground` content, on fills `muted` with `foreground` content.

**Consumer provides:** an icon and/or short label, `pressed` state, and `aria-label` when icon-only.

- Variants: `default` (no border) and `outline` (`input` hairline). Sizes `sm` 32px, default 36px (`control-md`), `lg` 40px; `radius`.
- Use for a setting that applies at once (show chart, wrap lines). For an action, use Button; for one choice among several, ToggleGroup.
