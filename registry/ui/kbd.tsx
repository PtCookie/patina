import * as React from "react";

import { cn } from "cn";

// A keyboard key: a small `muted` chip with muted text. Inside a Tooltip it flips to the page colours; inside
// an input, pass `className="bg-kbd"` for the quieter `kbd` tint.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      data-testid="kbd"
      className={cn(
        "inline-flex h-5.5 min-w-5.5 items-center justify-center gap-1 rounded-sm bg-muted px-1.5 font-sans text-xs/4 font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="kbd-group"
      data-testid="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
