import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

// A 44x20 track with a 24x16 thumb. Off sits on the `control-strong` fill; on fills `primary`, and the thumb
// swaps to its own tokens so it stays visible in both themes.
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-5 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-control-strong p-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block h-4 w-6 rounded-full bg-switch-thumb transition-transform duration-150 data-checked:translate-x-4 data-checked:bg-switch-thumb-checked"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
