// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Badge } from "../registry/ui/badge.tsx";
import { Button } from "../registry/ui/button.tsx";
import { Card, CardHeader } from "../registry/ui/card.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../registry/ui/pagination.tsx";
import { Sheet, SheetContent } from "../registry/ui/sheet.tsx";

afterEach(cleanup);

describe("default test ids", () => {
  it("are the slot names", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <Button>Save</Button>
        <Badge>New</Badge>
      </Card>,
    );
    expect(screen.getByTestId("card")).toBeTruthy();
    expect(screen.getByTestId("card-header").textContent).toBe("Header");
    expect(screen.getByTestId("button").textContent).toBe("Save");
    expect(screen.getByTestId("badge").textContent).toBe("New");
  });

  it("are replaced by a data-testid from the caller, or removed with undefined", () => {
    render(
      <Card data-testid="post">
        <CardHeader data-testid={undefined}>Header</CardHeader>
        <Badge data-testid="tag">New</Badge>
      </Card>,
    );
    expect(screen.queryByTestId("card")).toBeNull();
    expect(screen.getByTestId("post")).toBeTruthy();
    expect(screen.queryByTestId("card-header")).toBeNull();
    expect(screen.queryByTestId("badge")).toBeNull();
    expect(screen.getByTestId("tag").textContent).toBe("New");
  });

  it("name the previous and next links, and the link they extend can still be replaced", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#3" data-testid="go-next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(screen.getByTestId("pagination-previous").getAttribute("data-slot")).toBe("pagination-link");
    expect(screen.queryByTestId("pagination-next")).toBeNull();
    expect(screen.getByTestId("go-next")).toBeTruthy();
  });
});

describe("Pagination text", () => {
  const pager = (props: { nav?: object; previous?: object; next?: object; ellipsis?: object } = {}) => (
    <Pagination {...props.nav}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#1" {...props.previous} />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis {...props.ellipsis} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#3" {...props.next} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  it("is English by default", () => {
    render(pager());
    expect(screen.getByRole("navigation").getAttribute("aria-label")).toBe("Pagination");
    const previous = screen.getByRole("link", { name: "Go to previous page" });
    expect(previous.textContent).toBe("Previous");
    expect(screen.getByRole("link", { name: "Go to next page" }).textContent).toBe("Next");
    expect(screen.getByText("More pages").className).toContain("sr-only");
  });

  it("takes translations through label and text", () => {
    render(
      pager({
        nav: { label: "페이지 이동" },
        previous: { label: "이전 페이지로 이동", text: "이전" },
        next: { label: "다음 페이지로 이동", text: "다음" },
        ellipsis: { label: "더 많은 페이지" },
      }),
    );
    expect(screen.getByRole("navigation").getAttribute("aria-label")).toBe("페이지 이동");
    expect(screen.getByRole("link", { name: "이전 페이지로 이동" }).textContent).toBe("이전");
    expect(screen.getByRole("link", { name: "다음 페이지로 이동" }).textContent).toBe("다음");
    expect(screen.getByText("더 많은 페이지")).toBeTruthy();
    expect(screen.queryByText("More pages")).toBeNull();
  });

  it("lets a plain aria-label win over label", () => {
    render(pager({ nav: { label: "ignored", "aria-label": "Posts" } }));
    expect(screen.getByRole("navigation").getAttribute("aria-label")).toBe("Posts");
  });
});

describe("Sheet close label", () => {
  it("is Close by default and takes a translation", () => {
    const { unmount } = render(
      <Sheet defaultOpen>
        <SheetContent>Body</SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
    unmount();

    render(
      <Sheet defaultOpen>
        <SheetContent closeLabel="닫기">Body</SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "닫기" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    expect(screen.getByTestId("sheet-close")).toBeTruthy();
  });
});
