# NavigationMenu

The site's top navigation: ghost items in a row, with optional panels of links.

**Consumer provides:** items (links, or triggers with a panel), the current page, and for panels each link's title and one-line description.

- Items: 36px, `label` weight, padding `space-3`, `radius`; hover `muted`; the current page and an open trigger sit on `muted` at 50%. A trigger's caret turns 180° when open.
- Panel: `popover`, `radius-2xl`, padding `space-1.5`, `shadow-menu`; links pad `space-2` × `space-3` at `radius-md`, title in `label` weight, description 13/18 `muted-foreground`.
- Below 640px replace it with a Sheet.
