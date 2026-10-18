# Checkbox

16px square with `radius-sm` corners, filled with `input` at 90% when off and `primary` with a `primary-foreground` check when on.

**Consumer provides:** a label to its right (`label` style), checked state, and `disabled` when unavailable (50% opacity on the whole row).

- Focus: 2px `ring` outline, offset 2px. Invalid: `destructive` ring.
- Use for independent on/off options in forms and multi-select rows. For a setting that applies immediately, use Switch.
