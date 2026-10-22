import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CaretLeftIcon, CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react";

import { cn } from "cn";

// Page links: ghost 36px squares, the current page outlined on `background`. Use real links (an href per
// page) so pages are crawlable. Show first, last, current ± 1 and an ellipsis for the gaps.
const paginationLinkVariants = cva(
  "inline-flex h-(--control-md) min-w-(--control-md) items-center justify-center gap-1 rounded-lg border border-transparent text-sm font-medium text-foreground tabular-nums transition-colors duration-150 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:border-border aria-[current=page]:bg-background aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      edge: {
        none: "px-2.5",
        start: "pr-2.5 pl-2",
        end: "pr-2 pl-2.5",
      },
    },
    defaultVariants: {
      edge: "none",
    },
  },
);

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex items-center gap-1", className)} {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = { isActive?: boolean } & VariantProps<typeof paginationLinkVariants> &
  React.ComponentProps<"a">;

function PaginationLink({ className, isActive, edge, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(paginationLinkVariants({ edge }), className)}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<"a"> & { isActive?: boolean; text?: string }) {
  return (
    <PaginationLink aria-label="Go to previous page" edge="start" className={className} {...props}>
      <CaretLeftIcon className="size-4" aria-hidden />
      <span>{text}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<"a"> & { isActive?: boolean; text?: string }) {
  return (
    <PaginationLink aria-label="Go to next page" edge="end" className={className} {...props}>
      <span>{text}</span>
      <CaretRightIcon className="size-4" aria-hidden />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "pointer-events-none inline-flex h-(--control-md) min-w-(--control-md) items-center justify-center border border-transparent px-2.5 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      <DotsThreeIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  paginationLinkVariants,
};
