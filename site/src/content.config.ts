import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

// Every page of the site is an Astro page that renders a file from the repository, so the docs collection is empty.
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
