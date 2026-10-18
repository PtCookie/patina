# Button

Rounded (`radius`, 8px) button with an opt-in pill shape: `primary` for the one main action, outline/secondary/ghost for the rest, destructive as a tint, never a solid red fill.

**Consumer provides:** a short verb-first label in sentence case ("Commit", "Delete branch"), optional leading Phosphor icon (`icon-md`, 16px), `variant`, `size`, optional `shape` (`default` | `pill`), and an `aria-label` for icon-only buttons.

| variant | use |
|---|---|
| `default` | `primary` fill + `primary-foreground`. At most one per view. |
| `outline` | `border` hairline on `background` (transparent in dark). Toolbars, secondary actions. |
| `secondary` | `secondary` fill. Dialog cancel, the dialog close button. |
| `ghost` | No fill until hover (`muted`). Icon buttons in dense areas. |
| `destructive` | `destructive` text on its 10% (light) / 20% (dark) tint. Irreversible actions. |
| `link` | `link` text, underline on hover. Inline only. |

Sizes: `xs` 24px · `sm` 32px · default 36px (`control-md`) · `lg` 40px; icon sizes are square at the same heights. Radius `radius` (8px); `shape="pill"` switches to `radius-full` — use it for a whole group or screen at once, not one button among square-ish ones. Padding `space-3`, gap `space-1.5`, `label` type style. Pressed buttons move down 1px; disabled is 50% opacity; focus is a 2px `ring` outline, offset 2px.

Web: shadcn `<Button variant size>`. Slint: same variants, but use `compact-control` (28px) height and `radius-md`.
