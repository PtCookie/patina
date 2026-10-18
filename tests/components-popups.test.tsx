// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { Kbd } from "../registry/ui/kbd";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../registry/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../registry/ui/tooltip";

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

/** Base UI's tooltip popup has no role, so find it by its slot. */
const popup = (): Element => document.querySelector("[data-slot=tooltip-content]") as Element;

const classList = (element: Element): string[] => (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

describe("Tooltip", () => {
  const open = () =>
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Stage</TooltipTrigger>
          <TooltipContent>
            Stage all changes <Kbd>⌘S</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

  it("is an inverted 12px label with a 6px radius", () => {
    open();
    const tip = popup();
    expect(tip.getAttribute("data-slot")).toBe("tooltip-content");
    for (const name of [
      "bg-foreground",
      "text-background",
      "rounded-md",
      "px-3",
      "py-1.5",
      "text-xs/4",
      "gap-1.5",
      "inline-flex",
    ]) {
      expect(classList(tip)).toContain(name);
    }
  });

  it("flips a Kbd inside it to the page colours", () => {
    open();
    expect(classList(popup())).toEqual(
      expect.arrayContaining(["[&_[data-slot=kbd]]:bg-background", "[&_[data-slot=kbd]]:text-foreground"]),
    );
    expect(screen.getByText("⌘S").getAttribute("data-slot")).toBe("kbd");
  });

  it("opens 6px above its trigger by default", () => {
    open();
    const positioner = popup().parentElement as Element;
    expect(positioner.getAttribute("data-side")).toBe("top");
  });
});

describe("Select", () => {
  const select = (props: { defaultValue?: string; shape?: "default" | "pill"; defaultOpen?: boolean } = {}) =>
    render(
      <Select defaultValue={props.defaultValue ?? null} defaultOpen={props.defaultOpen}>
        <SelectTrigger shape={props.shape} aria-label="Branch">
          <SelectValue placeholder="Choose a branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Branches</SelectLabel>
            <SelectItem value="main">main</SelectItem>
            <SelectItem value="feature/diff-view">feature/diff-view</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="release/0.4">release/0.4</SelectItem>
        </SelectContent>
      </Select>,
    );

  it("renders a 36px control field with a muted placeholder, a caret and the default radius", () => {
    select();
    const trigger = screen.getByRole("combobox");
    for (const name of [
      "h-(--control-md)",
      "w-full",
      "bg-control",
      "border-transparent",
      "px-3",
      "text-sm",
      "rounded-lg",
      "cursor-pointer",
      "data-placeholder:text-muted-foreground",
      "justify-between",
    ]) {
      expect(classList(trigger)).toContain(name);
    }
    expect(classList(trigger)).not.toContain("rounded-full");
    // Base UI marks the placeholder state as `data-placeholder`.
    expect(trigger.hasAttribute("data-placeholder")).toBe(true);
    expect(trigger.textContent).toContain("Choose a branch");
    expect(trigger.querySelector("svg")).not.toBeNull();
  });

  it("is a pill when asked, replacing the radius", () => {
    select({ shape: "pill" });
    const trigger = screen.getByRole("combobox");
    expect(classList(trigger)).toContain("rounded-full");
    expect(classList(trigger)).not.toContain("rounded-lg");
  });

  it("opens a solid popover list, the same surface as the menu", () => {
    select({ defaultOpen: true });
    const list = screen.getByRole("listbox").closest("[data-slot=select-content]") as Element;
    for (const name of ["bg-popover", "rounded-2xl", "p-0", "shadow-(--shadow-menu)", "min-w-(--anchor-width)"]) {
      expect(classList(list)).toContain(name);
    }
  });

  it("lays rows out edge to edge, highlighted on accent, with a check on the selected one", () => {
    select({ defaultOpen: true, defaultValue: "main" });
    const rows = screen.getAllByRole("option");
    expect(rows).toHaveLength(3);
    for (const name of [
      "px-3",
      "py-2",
      "font-medium",
      "gap-2.5",
      "data-highlighted:bg-accent",
      "data-highlighted:text-accent-foreground",
    ]) {
      expect(classList(rows[0] as Element)).toContain(name);
    }
    expect(classList(rows[0] as Element)).not.toContain("rounded-md");
    expect(rows[0]?.querySelector("svg")).not.toBeNull();
    expect(rows[1]?.querySelector("svg")).toBeNull();
  });

  it("opens from the trigger and picks a value", () => {
    select();
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.keyDown(screen.getByRole("option", { name: "feature/diff-view" }), { key: "Enter" });
    expect(screen.getByRole("combobox").textContent).toContain("feature/diff-view");
    expect(screen.getByRole("combobox").hasAttribute("data-placeholder")).toBe(false);
  });

  it("styles the group label and separator like the menu", () => {
    select({ defaultOpen: true });
    expect(classList(screen.getByText("Branches"))).toEqual(
      expect.arrayContaining(["text-xs/4", "text-muted-foreground", "px-3"]),
    );
    const separator = document.querySelector("[data-slot=select-separator]") as Element;
    expect(classList(separator)).toEqual(expect.arrayContaining(["h-px", "bg-border"]));
  });
});
