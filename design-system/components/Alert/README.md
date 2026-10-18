# Alert

An inline message: icon, title (`label` weight) and description, padding `space-3` × `space-4`, `radius-2xl` (12px).

**Consumer provides:** a Phosphor icon matching the tone, a one-line title, an optional description, and optionally one action button at the top right.

- `default`: `card` surface with a `border` hairline, description in `muted-foreground` (Luma).
- `destructive`: `card` surface, title and description in `destructive` (Luma).
- ADDED `success` / `warning` / `info`: their `-muted` tint, no border, title and icon in the status color, description in `foreground`.
- Always pair tone with an icon and a word; never color alone.
