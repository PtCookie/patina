# Sheet

A panel that slides in from a screen edge over a dimmed, blurred overlay — the mobile navigation, or a side form.

**Consumer provides:** the side (`right` by default, `left`, `top`, `bottom`), a title and optional description, the body, an optional footer, and the open state.

- Side sheets are 75% wide up to 384px, on `background`, with a `border` edge and `shadow-menu`. Header and footer pad `space-6`; the close button is a small secondary icon button `space-4` from the corner.
- Overlay: black 30% with an 8px blur. Focus is trapped inside; Escape and overlay click close it.
- Close it before client-side navigation (Astro view transitions) so the page underneath is never left inert.
