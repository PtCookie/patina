# Collapsible

A header row with a ghost icon button that shows or hides the content below it; the caret turns 180° when open.

**Consumer provides:** the header text (`label` weight), the content, and the open state.

- The trigger is the icon button (`aria-expanded`, `aria-controls`); the header text may also toggle when it reads as a control.
- Content keeps its own surfaces; the collapsible adds none. For several stacked sections that each collapse, use an accordion pattern with `border` dividers.
