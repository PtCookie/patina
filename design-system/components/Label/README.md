# Label

The visible name of a form control: `label` weight (14px medium) at line-height 1, `foreground`.

**Consumer provides:** the text and the control it names (`htmlFor`, or wrap the control).

- Above text fields with `space-2` between; to the right of checkboxes, radios and switches with `space-2`.
- A disabled control dims its label to 50% too.
- Every input has a label — use `sr-only` when the design hides it, never a placeholder as the label.
