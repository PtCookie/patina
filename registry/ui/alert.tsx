import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "cn";

// An inline message on the `card` surface. The tinted variants (success, warning, info) drop the border and
// colour the icon and title; the description stays `foreground` so the body keeps full contrast. Always add an
// icon: the grid reserves its column only when one is present.
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] gap-y-0.5 rounded-2xl border px-4 py-3 text-sm has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 [&>svg]:row-span-2 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        success: "border-transparent bg-success-muted text-success [&_[data-slot=alert-description]]:text-foreground",
        warning: "border-transparent bg-warning-muted text-warning [&_[data-slot=alert-description]]:text-foreground",
        info: "border-transparent bg-info-muted text-info [&_[data-slot=alert-description]]:text-foreground",
        destructive: "border-border bg-card text-destructive [&_[data-slot=alert-description]]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-2 font-medium", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="alert-description" className={cn("col-start-2 text-muted-foreground", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
