import { describe, expect, it } from "vitest";
import { componentDocs, componentGroups, kebab, label } from "../site/src/lib/components.ts";
import { rehypeLinks } from "../site/src/lib/rehype-links.ts";

describe("the component list of the site", () => {
  const docs = componentDocs();

  it("has one entry for every preview, 27 in all", () => {
    expect(docs).toHaveLength(27);
    expect(docs.map((doc) => doc.name)).toEqual(
      expect.arrayContaining(["Button", "DropdownMenu", "DesktopShell", "Cover"]),
    );
  });

  it("takes the group and the card height from the @dsCard comment", () => {
    const tabs = docs.find((doc) => doc.name === "Tabs");
    expect(tabs).toMatchObject({ group: "Navigation", height: 150, page: false });
    expect(docs.find((doc) => doc.name === "DesktopShell")).toMatchObject({ group: "Desktop", page: true });
    // A preview without a group is a brand piece.
    expect(docs.find((doc) => doc.name === "Cover")).toMatchObject({ group: "Brand", hasReadme: false });
  });

  it("gives every component a unique URL segment and lists it in exactly one group", () => {
    expect(new Set(docs.map((doc) => doc.slug)).size).toBe(docs.length);
    const listed = componentGroups().flatMap(([, items]) => items.map((item) => item.name));
    expect([...listed].sort()).toEqual(docs.map((doc) => doc.name).sort());
  });

  it("writes names the way the agent documentation does", () => {
    expect(kebab("DropdownMenu")).toBe("dropdown-menu");
    expect(kebab("ToggleGroup")).toBe("toggle-group");
    expect(label("DropdownMenu")).toBe("Dropdown menu");
  });
});

describe("rehypeLinks", () => {
  const tree = () => ({
    type: "root",
    children: [
      { type: "element", tagName: "h1", children: [{ type: "text" }] },
      { type: "element", tagName: "h1", children: [] },
      {
        type: "raw",
        value: '<p><img src="docs/header.svg" alt="x"> <a href="LICENSE">l</a> <a href="https://x.dev/a">x</a></p>',
      },
      { type: "element", tagName: "a", properties: { href: "README.ko.md" }, children: [] },
      { type: "element", tagName: "a", properties: { href: "design-system/README.md" }, children: [] },
      { type: "element", tagName: "a", properties: { href: "https://llmstxt.org" }, children: [] },
    ],
  });

  it("drops the first heading and keeps the next one", () => {
    const result = tree();
    rehypeLinks()(result);
    expect(result.children.filter((node) => node.tagName === "h1")).toHaveLength(1);
  });

  it("points repository links at the site and leaves other links alone", () => {
    const result = tree();
    rehypeLinks()(result);
    const hrefs = result.children.map((node) => node.properties?.href).filter(Boolean);
    expect(hrefs).toEqual(["/ko/", "/guide/design/", "https://llmstxt.org"]);
  });

  it("rewrites the attributes of raw HTML, such as the README banner", () => {
    const result = tree();
    rehypeLinks()(result);
    const raw = result.children.find((node) => node.type === "raw")?.value ?? "";
    expect(raw).toContain('src="/header.svg"');
    expect(raw).toContain('href="/LICENSE"');
    expect(raw).toContain('href="https://x.dev/a"');
  });
});
