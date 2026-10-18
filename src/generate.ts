// Turns a verified token set into the text files that are served from public/. Pure: no file system access.
// The binary font files (src/fonts.ts) and the component sources (src/components.ts) are read by the build and
// passed in.

import type { ComponentSpec } from "./components";
import { agentFiles, type AgentDocs } from "./emit/agent";
import { colorKt, iconsKt, shapeKt, sizeKt, typeKt } from "./emit/android";
import { fontFaceCss } from "./emit/fontface";
import { baseItem, json, registryIndex, type RegistryItem } from "./emit/registry";
import { slintTokens } from "./emit/slint";
import type { TokenSet } from "./tokens";

/** Path below public/ to file content. */
export function generate(
  set: TokenSet,
  version: string,
  components: readonly RegistryItem[] = [],
  agent?: { specs: readonly ComponentSpec[]; docs: AgentDocs },
  /** The hand-written Slint library, by path below public/ (see slint-lib.ts). */
  slintLibrary: Record<string, string> = {},
  /** The hand-written Android library and the Phosphor SVGs it draws (see android-lib.ts). */
  android?: { library: Record<string, string>; icons: Record<string, string> },
): Record<string, string> {
  const base = baseItem(set, version);
  const items = [base, ...components];
  return {
    ...Object.fromEntries(items.map((item) => [`r/${item.name}.json`, json(item)])),
    "r/registry.json": json(registryIndex(items)),
    ...slintLibrary,
    ...(android ? { ...android.library, "android/Icons.kt": iconsKt(android.icons, version) } : {}),
    "slint/tokens.slint": slintTokens(set, version),
    "android/Color.kt": colorKt(set, version),
    "android/Type.kt": typeKt(set, version),
    "android/Shape.kt": shapeKt(set, version),
    "android/Size.kt": sizeKt(set, version),
    "fonts/patina-fonts.css": fontFaceCss(set, version),
    ...(agent ? agentFiles(set, agent.specs, version, agent.docs) : {}),
  };
}
