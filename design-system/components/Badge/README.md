# Badge

One or two words of status or metadata beside a name — a branch, a tag, a check result.

**Consumer provides:** the word(s), a `variant`, and for status variants a leading Phosphor icon (`icon-sm`, 12px).

- Pill (`radius-full`), 20px tall, `caption` (12/16 medium), padding `space-0.5` × `space-2`.
- `default` (`primary`), `secondary`, `outline` (`border` hairline) carry no meaning — use them for refs, versions, labels.
- Status uses a tint, never a solid fill: `success` on `success-muted`, `warning` on `warning-muted`, `info` on `info-muted`, `destructive` on its own 10%/20% tint. **Always pair a status badge with its icon** (check-circle, warning, info, x-circle) — success, primary and destructive are told apart by hue.
- Do not put a badge inside a button.
