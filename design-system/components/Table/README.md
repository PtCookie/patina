# Table

Hairline-ruled data table in two densities.

**Consumer provides:** column headers, rows, which columns are numeric (right-aligned, tabular numerals) and which hold identifiers (SHAs, IDs, timestamps → `mono`), and the selected row.

| | comfortable (Web, Luma) | compact (Slint, ADDED) |
|---|---|---|
| header | `table-head` 48px, `label` in `foreground` | `compact-head` 32px, `compact-label` in `muted-foreground` |
| cell | padding `space-3` (≈44px rows), `body` | `compact-row` 28px, padding `compact-pad`, `compact-body` |

- `containerClassName` styles the scroll wrapper — give it a `max-height` so a `sticky` header row scrolls inside the table instead of the page.
- Rows divide with `border`; hover `muted` at 50%; selected `muted`.
- No zebra stripes, no vertical rules. Cells don't wrap — truncate and offer a tooltip.
