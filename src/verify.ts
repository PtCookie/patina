// Every check that must hold before anything is generated. An empty result means the token snapshot is sound.

import { checkContrast } from "./contrast";
import { checkDerived } from "./derived";
import { m3Contrast, m3Scheme } from "./m3";
import { THEMES, type TokenSet } from "./tokens";

export function verifyTokens(set: TokenSet): string[] {
  const problems: string[] = [];

  for (const issue of checkDerived(set)) {
    problems.push(`derived ${issue.token}${issue.theme ? ` (${issue.theme})` : ""}: ${issue.message}`);
  }
  for (const issue of checkContrast(set)) {
    problems.push(`contrast ${issue.id} (${issue.theme}): ${issue.message}`);
  }
  for (const theme of THEMES) {
    for (const result of m3Contrast(m3Scheme(set, theme))) {
      if (!result.ok) {
        problems.push(
          `android ${result.foreground}/${result.background} (${theme}): ${result.ratio.toFixed(2)}:1 is below ${result.min}:1`,
        );
      }
    }
  }
  return problems;
}
