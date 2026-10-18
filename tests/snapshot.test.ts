import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

describe("design-system snapshot", () => {
  it("records a snapshot version id", () => {
    expect(read("design-system/VERSION").trim()).toMatch(/^\d+-[0-9a-f]+$/);
  });

  it("has a parseable tokens.json named Patina", () => {
    const tokens = JSON.parse(read("design-system/tokens.json")) as { name: string; color: { tokens: unknown[] } };
    expect(tokens.name).toBe("Patina");
    expect(tokens.color.tokens.length).toBeGreaterThan(0);
  });
});
