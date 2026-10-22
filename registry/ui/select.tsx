import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";

import { cn } from "cn";

// A field that opens a solid list, the same surface and rows as DropdownMenu. The trigger is a 36px
// `control` field with a muted caret that turns while the list is open; the selected row shows a check.
const Select = SelectPrimitive.Root;

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" data-testid="select-group" {...props} />;
}

function SelectValue({ ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" data-testid="select-value" {...props} />;
}

function SelectTrigger({
  className,
  shape = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { shape?: "default" | "pill" }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-testid="select-trigger"
      className={cn(
        "group/select flex h-(--control-md) w-full cursor-pointer items-center justify-between gap-1.5 border border-transparent bg-control px-3 text-left text-sm whitespace-nowrap text-foreground transition-colors duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-invalid-border aria-invalid:ring-3 aria-invalid:ring-invalid-ring data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        shape === "pill" ? "rounded-full" : "rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <CaretDownIcon
            aria-hidden
            className="text-muted-foreground transition-transform duration-150 group-aria-expanded/select:rotate-180"
          />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger">) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50 outline-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-testid="select-content"
          className={cn(
            "z-50 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-2xl bg-popover p-0 text-popover-foreground shadow-(--shadow-menu) outline-none",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      data-testid="select-label"
      className={cn("px-3 pt-2.5 pb-1 text-xs/4 text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      data-testid="select-item"
      className={cn(
        "relative flex cursor-default items-center gap-2.5 px-3 py-2 text-sm font-medium outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 items-center gap-2.5">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator render={<span className="ml-auto flex items-center" />}>
        <CheckIcon aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      data-testid="select-separator"
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
