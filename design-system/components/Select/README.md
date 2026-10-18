# Select

A trigger that looks like an Input (50% `input` fill, `radius` 8px — `radius-full` with the `pill` shape — 36px) and opens a Menu-styled list.

**Consumer provides:** label, options (text plus optional leading icon), the selected value or a placeholder, optional `shape` (`default` | `pill`) matching the inputs beside it.

- Trigger: padding `space-3`, gap `space-1.5`, caret-down in `muted-foreground`; placeholder text in `muted-foreground`. `sm` size is 32px.
- List: opens `space-1` (4px) below the trigger. Same surface as Dropdown menu — `popover`, `radius-2xl`, no padding, `shadow-menu`; items are full-width rows (`label` style, padding `space-2` × `space-3`, no radius); hover and keyboard focus fill the whole row with `accent`; the chosen one shows a trailing check.
- Use a Select for 4–15 choices; fewer → Tabs or radio; more → a searchable combobox.
