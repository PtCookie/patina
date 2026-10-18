# Input

Borderless text field: a 50% `input` fill, rounded to `radius` (8px, or `radius-full` with the `pill` shape), with an optional label, description and inline icon or kbd (input group).

**Consumer provides:** a visible label (`label` style, 14/14 medium) above, optional description in `muted-foreground` below, placeholder text, optional `shape` (`default` | `pill`), and `aria-invalid` when validation fails.

- Height `control-md` (36px), padding `space-1` × `space-3`. Text is `body` (14/20); below 768px web renders 16px to stop iOS zoom.
- Fill: `input` at 50%. No border at rest. Focus: 2px `ring` outline, offset 2px. Invalid: 3px `destructive` at 20% (dark: 40%, plus a 50% border) and the description switches to `destructive`.
- Textarea: same fill, `radius` (no pill shape), min-height 100px, padding `space-3`, not resizable.
- Input group (icon + input + kbd): `radius`, or `radius-full` with `pill`; the ring goes around the whole group; icon in `muted-foreground`; kbd tinted `muted-foreground` at 10%.
- Paths, SHAs and SQL in inputs use the `mono` style.
