## Design system: Patina

This project uses the Patina design system (`https://patina.ptcookie.net`). Before building or changing UI, read `https://patina.ptcookie.net/llms-full.txt` (or the index at `/llms.txt`).

- Use colour only by semantic token name (`bg-background`, `text-muted-foreground`, `border-border`). Never write hex, `oklch()` or `rgb()` literals, Tailwind palette classes, `dark:` colour overrides or opacity modifiers on colours; never compute state colours with `color-mix()`.
- Use Patina components: `npx shadcn@latest add @patina/<name>`. Install them before stock shadcn components; if the CLI asks to overwrite an existing file such as `button.tsx`, answer no and never pass `--overwrite`.
- One primary action per view. Destructive actions are tinted, not solid. Emerald text is `text-link`, not `text-primary`. Show status with an icon and a word.
- Icons are Phosphor (regular; fill only for selected). Copy is sentence case, starts with a verb and is short.
- If a design needs a value that has no token, say so; do not add a literal.
