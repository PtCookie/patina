# DropdownMenu

Solid menu with full-width rows: `popover` surface, `radius-2xl`, no padding, `shadow-menu`, min-width 192px.

**Consumer provides:** items (Phosphor icon, label, optional shortcut), optional group labels and separators, and at most one destructive item, last.

- Items are rows like a table's: they span the menu edge to edge, no inset and no radius. With no group label above it, the first row's highlight runs to the menu's top edge, and the last row's to the bottom edge — the menu clips both to its corners. Padding `space-2` × `space-3`, gap `space-2.5`, `label` style.
- Hover and keyboard highlight fill the whole row with `accent` / `accent-foreground`.
- Group label: `caption-regular` in `muted-foreground`, padding `space-2` `space-3` `space-1`. Shortcut: 12px, letter-spacing .1em, `muted-foreground`, right-aligned.
- Separator: full-width `border` hairline with `space-1` above and below.
- Destructive item: `destructive` text and icon; its row highlights on the 10%/20% `destructive` tint.
- Opaque `popover` (Solid) with Subtle accent; no translucent menus.
