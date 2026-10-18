# Card

A `card` surface with `radius-3xl` (16px), padding and gap `space-6`, and `shadow-card` (a 1px `foreground` ring at 5%/10% plus a soft shadow) instead of a border.

**Consumer provides:** header (title in `heading-md` — JetBrains Mono 16/24 medium — and an optional description in `muted-foreground`), content, and an optional right-aligned footer of buttons.

- `sm` size drops padding and gap to `space-4`.
- `interactive` (a card that is one link, like a post card): the ring strengthens on hover to `foreground` 10% (dark 20%); the whole card is the hit target, with one link inside carrying the accessible name.
- Images flush to the top drop the top padding and keep the corner radius.
- Do not nest cards; use a hairline (`border`) to divide inside one.
