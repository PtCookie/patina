# Popover

A floating `popover` surface anchored to its trigger, for a small form or detail that should not leave the page: `radius-2xl`, padding `space-4`, gap `space-3`, `shadow-menu`, 288px wide by default.

**Consumer provides:** the trigger (usually an outline or ghost Button), an optional header (title in `heading-md`, description in `muted-foreground`), and the content.

- Opens `space-1` from its trigger and closes on Escape and outside click; focus moves into it and returns to the trigger.
- Short lists of actions → DropdownMenu; anything longer than one short form → Sheet or a page.
