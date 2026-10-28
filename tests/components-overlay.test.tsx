// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu.tsx";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkDescription,
  NavigationMenuLinkTitle,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../registry/ui/navigation-menu.tsx";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../registry/ui/popover.tsx";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetLink,
  SheetTitle,
  SheetTrigger,
} from "../registry/ui/sheet.tsx";

// jsdom lacks the observers the popup positioning uses.
beforeAll(() => {
  class Observer {
    observe(): void {
      /* no-op: nothing is measured in jsdom */
    }
    unobserve(): void {
      /* no-op */
    }
    disconnect(): void {
      /* no-op */
    }
  }
  globalThis.ResizeObserver ??= Observer as unknown as typeof ResizeObserver;
  globalThis.IntersectionObserver ??= Observer as unknown as typeof IntersectionObserver;
});

afterEach(cleanup);

const classList = (element: Element): string[] => (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

describe("DropdownMenu", () => {
  const open = () =>
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>feature/diff-view</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Branch</DropdownMenuLabel>
            <DropdownMenuItem>
              Merge into current
              <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Copy name</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete branch</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

  it("is an opaque popover surface with no padding, clipped to its radius", () => {
    open();
    const menu = screen.getByRole("menu");
    expect(menu.getAttribute("data-slot")).toBe("dropdown-menu-content");
    for (const name of [
      "bg-popover",
      "text-popover-foreground",
      "rounded-2xl",
      "p-0",
      "min-w-48",
      "shadow-(--shadow-menu)",
      "overflow-x-hidden",
      "overflow-y-auto",
    ]) {
      expect(classList(menu)).toContain(name);
    }
  });

  it("makes rows span the menu: no radius, 10px gap, 8px by 12px padding, medium weight", () => {
    open();
    const row = screen.getByRole("menuitem", { name: /Copy name/ });
    for (const name of [
      "flex",
      "items-center",
      "gap-2.5",
      "px-3",
      "py-2",
      "text-sm",
      "font-medium",
      "data-highlighted:bg-accent",
      "data-highlighted:text-accent-foreground",
    ]) {
      expect(classList(row)).toContain(name);
    }
    expect(classList(row).some((name) => name.startsWith("rounded"))).toBe(false);
  });

  it("styles the destructive row with the destructive tint instead of the accent", () => {
    open();
    const row = screen.getByRole("menuitem", { name: /Delete branch/ });
    expect(row.getAttribute("data-variant")).toBe("destructive");
    for (const name of [
      "text-destructive",
      "data-highlighted:bg-destructive-muted",
      "data-highlighted:text-destructive",
    ]) {
      expect(classList(row)).toContain(name);
    }
    expect(classList(row)).not.toContain("data-highlighted:bg-accent");
  });

  it("has a group label, a shortcut and a full-width separator", () => {
    open();
    const label = screen.getByText("Branch");
    for (const name of ["px-3", "pt-2.5", "pb-1", "text-xs", "text-muted-foreground"]) {
      expect(classList(label)).toContain(name);
    }
    const shortcut = screen.getByText("⌘M");
    for (const name of ["ml-auto", "text-xs", "leading-4", "tracking-widest", "text-muted-foreground"]) {
      expect(classList(shortcut)).toContain(name);
    }
    const separator = screen.getByRole("separator");
    for (const name of ["my-1", "h-px", "bg-border"]) expect(classList(separator)).toContain(name);
    expect(classList(separator).some((name) => name.startsWith("-mx"))).toBe(false);
  });

  it("is closed until opened", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button", { name: "Open" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("shows a check at the end of a checked item or the selected radio", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>View</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem defaultChecked>Show hidden</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup defaultValue="list">
            <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const checkbox = screen.getByRole("menuitemcheckbox", { name: /Show hidden/ });
    expect(checkbox.querySelector("svg")).not.toBeNull();
    expect(checkbox.querySelector("[data-slot=dropdown-menu-checkbox-item-indicator]")?.className).toContain("ml-auto");
    expect(screen.getByRole("menuitemradio", { name: /List/ }).querySelector("svg")).not.toBeNull();
    expect(screen.getByRole("menuitemradio", { name: /Grid/ }).querySelector("svg")).toBeNull();
  });
});

describe("Popover", () => {
  it("is a popover surface with the header, title and description styles", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Presets</PopoverTrigger>
        <PopoverContent aria-label="Save preset">
          <PopoverHeader>
            <PopoverTitle>Save preset</PopoverTitle>
            <PopoverDescription>Keep the current filters for later.</PopoverDescription>
          </PopoverHeader>
          <input aria-label="Name" />
        </PopoverContent>
      </Popover>,
    );
    const dialog = screen.getByRole("dialog");
    for (const name of [
      "bg-popover",
      "text-popover-foreground",
      "rounded-2xl",
      "w-72",
      "p-4",
      "gap-3",
      "flex",
      "flex-col",
      "shadow-(--shadow-menu)",
    ]) {
      expect(classList(dialog)).toContain(name);
    }
    expect(classList(screen.getByText("Save preset"))).toEqual(
      expect.arrayContaining(["font-heading", "text-base", "font-medium"]),
    );
    expect(classList(screen.getByText("Keep the current filters for later."))).toEqual(
      expect.arrayContaining(["text-sm", "text-muted-foreground"]),
    );
    expect(classList(screen.getByText("Save preset").parentElement as Element)).toEqual(
      expect.arrayContaining(["flex", "flex-col", "gap-1"]),
    );
  });

  it("is closed until opened and labels its trigger as a popup", () => {
    render(
      <Popover>
        <PopoverTrigger>Presets</PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Presets" }).getAttribute("aria-expanded")).toBe("false");
  });
});

describe("Sheet", () => {
  const open = (side?: "top" | "right" | "bottom" | "left") =>
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open menu</SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Posts, work and links.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <SheetLink href="#home" aria-current="page">
              Home
            </SheetLink>
            <SheetLink href="#posts">Posts</SheetLink>
          </SheetBody>
          <SheetFooter>Footer</SheetFooter>
        </SheetContent>
      </Sheet>,
    );

  it("is a side panel on the background with a border edge, shadow-menu and 75% width up to 384px", () => {
    open();
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("data-side")).toBe("right");
    for (const name of [
      "fixed",
      "flex",
      "flex-col",
      "bg-background",
      "text-foreground",
      "border-border",
      "shadow-(--shadow-menu)",
      "data-[side=right]:w-3/4",
      "data-[side=right]:border-l",
      "data-[side=right]:sm:max-w-sm",
    ]) {
      expect(classList(dialog)).toContain(name);
    }
  });

  it.each(["top", "right", "bottom", "left"] as const)("takes the %s side", (side) => {
    open(side);
    expect(screen.getByRole("dialog").getAttribute("data-side")).toBe(side);
    expect(classList(screen.getByRole("dialog"))).toEqual(
      expect.arrayContaining([
        `data-[side=${side}]:${side === "left" || side === "right" ? "inset-y-0" : "inset-x-0"}`,
      ]),
    );
  });

  it("has a title in the heading font, a description, header, body and footer paddings", () => {
    open();
    expect(classList(screen.getByText("Menu"))).toEqual(
      expect.arrayContaining(["font-heading", "text-base", "font-medium", "text-foreground"]),
    );
    expect(classList(screen.getByText("Posts, work and links."))).toEqual(
      expect.arrayContaining(["text-sm", "text-muted-foreground"]),
    );
    expect(classList(screen.getByText("Menu").parentElement as Element)).toEqual(
      expect.arrayContaining(["flex", "flex-col", "gap-1.5", "p-6"]),
    );
    expect(classList(screen.getByText("Footer"))).toEqual(
      expect.arrayContaining(["flex", "justify-end", "gap-2", "p-6", "mt-auto"]),
    );
    expect(classList(screen.getByText("Home").parentElement as Element)).toEqual(
      expect.arrayContaining(["flex-1", "flex-col", "gap-1", "px-6"]),
    );
  });

  it("closes with a small secondary icon button in the corner", () => {
    open();
    const close = screen.getByRole("button", { name: "Close" });
    for (const name of ["absolute", "top-4", "right-4", "bg-secondary", "size-(--control-sm)", "rounded-lg"]) {
      expect(classList(close)).toContain(name);
    }
    fireEvent.click(close);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("can hide the close button", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent showCloseButton={false}>Body</SheetContent>
      </Sheet>,
    );
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("has an overlay of the overlay token with an 8px blur", () => {
    open();
    const overlay = document.querySelector("[data-slot=sheet-overlay]");
    expect(overlay).not.toBeNull();
    for (const name of ["fixed", "inset-0", "bg-overlay", "backdrop-blur-sm", "duration-100"]) {
      expect(classList(overlay as Element)).toContain(name);
    }
  });

  it("styles navigation rows and marks the current page", () => {
    open();
    const current = screen.getByRole("link", { name: "Home" });
    for (const name of [
      "flex",
      "h-(--control-md)",
      "items-center",
      "gap-2.5",
      "rounded-lg",
      "px-3",
      "font-medium",
      "hover:bg-muted",
      "aria-[current=page]:bg-muted",
    ]) {
      expect(classList(current)).toContain(name);
    }
    expect(current.getAttribute("aria-current")).toBe("page");
  });
});

describe("NavigationMenu", () => {
  const menu = (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#home" aria-current="page" variant="item">
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Work</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#pathpoint">
              <NavigationMenuLinkTitle>PathPoint</NavigationMenuLinkTitle>
              <NavigationMenuLinkDescription>Desktop Git client in Slint.</NavigationMenuLinkDescription>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  it("renders ghost items 36px tall with the current page on the quiet muted tint", () => {
    render(menu);
    const home = screen.getByRole("link", { name: "Home" });
    for (const name of [
      "h-(--control-md)",
      "rounded-lg",
      "px-3",
      "text-sm",
      "font-medium",
      "text-foreground",
      "bg-transparent",
      "hover:bg-muted",
      "aria-[current=page]:bg-muted-hover",
      "focus-visible:outline-2",
      "focus-visible:outline-ring",
    ]) {
      expect(classList(home)).toContain(name);
    }
    // The panel-link layout does not leak into a top-level item.
    for (const name of ["flex-col", "py-2", "rounded-md", "gap-0.5"]) {
      expect(classList(home)).not.toContain(name);
    }
  });

  it("gives the trigger a caret that turns when the panel is open", () => {
    render(menu);
    const trigger = screen.getByRole("button", { name: "Work" });
    for (const name of ["h-(--control-md)", "rounded-lg", "data-popup-open:bg-muted-hover", "hover:bg-muted"]) {
      expect(classList(trigger)).toContain(name);
    }
    const caret = trigger.querySelector("svg");
    expect(caret).not.toBeNull();
    expect(classList(caret as Element)).toEqual(
      expect.arrayContaining(["size-4", "group-data-popup-open/navigation-menu-trigger:rotate-180"]),
    );
  });

  it("is a nav list and keeps the panel closed until the trigger opens it", async () => {
    render(menu);
    expect(screen.getByRole("navigation")).not.toBeNull();
    expect(screen.queryByText("PathPoint")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Work" }));
    const title = await screen.findByText("PathPoint");
    const link = title.closest("a") as HTMLElement;
    for (const name of ["flex", "flex-col", "gap-0.5", "rounded-md", "px-3", "py-2", "hover:bg-muted"]) {
      expect(classList(link)).toContain(name);
    }
    expect(classList(title)).toContain("font-medium");
    expect(classList(within(link).getByText("Desktop Git client in Slint."))).toEqual(
      expect.arrayContaining(["text-[13px]/[18px]", "text-muted-foreground"]),
    );
    // The panel is two columns of links by default.
    expect(classList(link.parentElement as Element)).toEqual(
      expect.arrayContaining(["grid", "grid-cols-2", "gap-1", "p-1.5", "w-[420px]"]),
    );
  });

  it("exposes the item style so a top-level link can match a trigger", () => {
    const style = navigationMenuTriggerStyle().split(/\s+/);
    for (const name of ["h-(--control-md)", "rounded-lg", "px-3", "font-medium", "hover:bg-muted"]) {
      expect(style).toContain(name);
    }
  });
});
