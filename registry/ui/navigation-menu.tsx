import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The site's top navigation: ghost items in a row, with optional panels of links. Below 640px, use a Sheet.
function NavigationMenu({
  align = "start",
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props & Pick<NavigationMenuPrimitive.Positioner.Props, "align">) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-0", className)}
      {...props}
    />
  );
}

function NavigationMenuItem({ className, ...props }: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />
  );
}

// A top-level item: 36px, medium weight. Hover fills `muted`; the current page and an open trigger sit on the
// quieter `muted-hover`. Triggers use it directly; a top-level link uses `<NavigationMenuLink variant="item">`.
const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-(--control-md) w-max items-center justify-center gap-1 rounded-lg border-0 bg-transparent px-3 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-[current=page]:bg-muted-hover data-popup-open:bg-muted-hover data-open:bg-muted-hover",
);

function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <CaretDownIcon
        className="size-4 transition-transform duration-150 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

// The panel content: two columns of links by default.
function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn("grid h-full w-[420px] grid-cols-2 gap-1 p-1.5", className)}
      {...props}
    />
  );
}

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) data-instant:transition-none",
          className,
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-2xl bg-popover text-popover-foreground shadow-(--shadow-menu) outline-none">
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden rounded-2xl" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

// `panel` (default) is a link inside a panel: a title and a one-line description, stacked. `item` is a top-level
// link in the bar, styled like a trigger. The two never share classes, so className can add to either safely.
const navigationMenuLinkVariants = cva("", {
  variants: {
    variant: {
      panel:
        "flex flex-col gap-0.5 rounded-md px-3 py-2 text-sm text-inherit transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      item: navigationMenuTriggerStyle(),
    },
  },
  defaultVariants: {
    variant: "panel",
  },
});

function NavigationMenuLink({
  className,
  variant,
  ...props
}: NavigationMenuPrimitive.Link.Props & VariantProps<typeof navigationMenuLinkVariants>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(navigationMenuLinkVariants({ variant }), className)}
      {...props}
    />
  );
}
function NavigationMenuLinkTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="navigation-menu-link-title" className={cn("font-medium", className)} {...props} />;
}

function NavigationMenuLinkDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="navigation-menu-link-description"
      className={cn("text-[13px]/[18px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkDescription,
  NavigationMenuLinkTitle,
  NavigationMenuList,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
};
