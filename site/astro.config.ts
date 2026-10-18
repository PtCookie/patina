import { copyFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import { previewCss, type RawTokens } from "../src/emit/previewcss";
import { componentGroups } from "./src/lib/components";
import { rehypeLinks } from "./src/lib/rehype-links";

const root = new URL("../", import.meta.url);
const tokens = JSON.parse(readFileSync(new URL("design-system/tokens.json", root), "utf8")) as RawTokens;

// The README banner and the social preview live in docs/; the site serves its own copies (git-ignored).
for (const file of ["header.svg", "social-preview.png"]) {
  copyFileSync(fileURLToPath(new URL(`docs/${file}`, root)), fileURLToPath(new URL(`public/${file}`, import.meta.url)));
}

export default defineConfig({
  site: "https://patina.ptcookie.net",
  markdown: { processor: unified({ rehypePlugins: [rehypeLinks] }) },
  integrations: [
    starlight({
      title: "Patina",
      description:
        "A design system for web, Slint desktop and Android apps: one emerald accent on a calm blue-gray neutral.",
      favicon: "/favicon.svg",
      customCss: [
        "@fontsource-variable/inter/index.css",
        "@fontsource-variable/jetbrains-mono/index.css",
        "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css",
        "./src/styles/custom.css",
      ],
      head: [
        { tag: "style", content: previewCss(tokens) },
        { tag: "meta", attrs: { property: "og:image", content: "https://patina.ptcookie.net/social-preview.png" } },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
      ],
      sidebar: [
        {
          label: "Overview",
          items: [
            { label: "Patina", link: "/" },
            { label: "한국어", link: "/ko/" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Design guide", link: "/guide/design/" },
            { label: "Android", link: "/guide/android/" },
            { label: "For AI agents", link: "/guide/agents/" },
          ],
        },
        { label: "Components", items: [{ label: "All components", link: "/components/" }] },
        ...componentGroups().map(([group, items]) => ({
          label: group,
          collapsed: true,
          items: items.map((item) => ({ label: item.name, link: `/components/${item.slug}/` })),
        })),
      ],
      // Slint has no bundled highlighter grammar; its code blocks render as plain text.
      expressiveCode: { shiki: { langAlias: { slint: "txt" } } },
      pagefind: true,
    }),
  ],
});
