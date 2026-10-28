// Reads the sources of the agent-facing documentation (see emit/agent.ts) from the repo.

import { readFileSync } from "node:fs";
import { COMPONENTS } from "./components.ts";
import type { AgentDocs } from "./emit/agent.ts";

/** `dropdown-menu` is the folder `DropdownMenu` under design-system/components. */
export const componentFolder = (name: string): string =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

export function agentDocs(root: URL): AgentDocs {
  const read = (path: string): string => readFileSync(new URL(path, root), "utf8");
  return {
    guide: read("docs/agent-guide.md"),
    snippet: read("docs/agents-snippet.md"),
    design: read("design-system/README.md"),
    android: read("design-system/Android.md"),
    tokensJson: read("design-system/tokens.json"),
    components: Object.fromEntries(
      COMPONENTS.map((spec) => [spec.name, read(`design-system/components/${componentFolder(spec.name)}/README.md`)]),
    ),
  };
}
