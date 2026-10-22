# Table

Hairline-ruled data table in two densities.

**Consumer provides:** column headers, rows, which columns are numeric (right-aligned, tabular numerals) and which hold identifiers (SHAs, IDs, timestamps → `mono`), and the selected row.

| | comfortable (Web, Luma) | compact (Slint, ADDED) |
|---|---|---|
| header | `table-head` 48px, `label` in `foreground` | `compact-head` 32px, `compact-label` in `muted-foreground` |
| cell | padding `space-3` (≈44px rows), `body` | `compact-row` 28px, padding `compact-pad`, `compact-body` |

- `containerClassName` styles the scroll wrapper — give it a `max-height` so a `sticky` header row scrolls inside the table instead of the page.
- Rows divide with `border`; hover `muted` at 50%; selected `muted`.
- **Sticky cells must be opaque.** A pinned first column or a sticky header paints over the cells that scroll under it, so it cannot use the translucent row hover (`muted-hover`). Give it the surface (`background`, or `card` inside a card) and lay the hover tint over it with a gradient of the same token: `background-color: var(--background)`, and on row hover `background-image: linear-gradient(var(--muted-hover), var(--muted-hover))`. The result is exactly the colour of a hovered row, with no new token. In Tailwind: `bg-background group-hover/row:bg-[linear-gradient(var(--muted-hover),var(--muted-hover))]`, with `group/row` on the row. A selected row is the opaque `muted`.
- No zebra stripes, no vertical rules. Cells don't wrap — truncate and offer a tooltip.
