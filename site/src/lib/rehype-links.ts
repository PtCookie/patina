// Rewrites the repository-relative links and images in the Markdown that the site renders (the README, the guides)
// to the site's own URLs, and drops each file's first `# heading`: the page title already shows it.

interface Node {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
}

const targets: Record<string, string> = {
  "README.md": "/",
  "README.ko.md": "/ko/",
  "design-system/README.md": "/guide/design/",
  "design-system/Android.md": "/guide/android/",
  "docs/agent-guide.md": "/guide/agents/",
  "docs/header.svg": "/header.svg",
  LICENSE: "/LICENSE",
  "THIRD_PARTY_NOTICES.md": "/THIRD_PARTY_NOTICES.md",
};

export function rehypeLinks() {
  return (tree: Node): void => {
    let removed = false;
    const walk = (node: Node): void => {
      node.children = (node.children ?? []).filter((child) => {
        if (!removed && child.type === "element" && child.tagName === "h1") {
          removed = true;
          return false;
        }
        return true;
      });
      // Raw HTML in the Markdown (the README's centred banner) is not parsed yet: rewrite its attributes in place.
      if (node.type === "raw" && typeof node.value === "string") {
        node.value = node.value.replace(/\b(href|src)="([^"]+)"/g, (match, key: string, value: string) =>
          value in targets ? `${key}="${targets[value]}"` : match,
        );
      }
      const props = node.properties;
      if (props) {
        for (const key of ["href", "src"]) {
          const value = props[key];
          if (typeof value === "string" && value in targets) props[key] = targets[value];
        }
      }
      for (const child of node.children) walk(child);
    };
    walk(tree);
  };
}
