import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "cn";

// Status badges are a tint with its colour as text, never a solid fill. Always pair them with an icon.
const badgeVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary-hover",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary-hover",
        outline: "border-border text-foreground [a]:hover:bg-outline-hover",
        destructive: "border-transparent bg-destructive-muted text-destructive [a]:hover:bg-destructive-muted-hover",
        success: "border-transparent bg-success-muted text-success",
        warning: "border-transparent bg-warning-muted text-warning",
        info: "border-transparent bg-info-muted text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  // A variable, not a literal in the call: the props type has no `data-*` keys, but the attribute is valid.
  const defaults = { "data-testid": "badge", className: cn(badgeVariants({ variant }), className) };

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(defaults, props),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
