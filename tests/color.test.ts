import { describe, expect, it } from "vitest";
import { contrast, flatten, oklchToLinear, parseOklch, toHex, WHITE } from "../src/color.ts";

// Reference values come from `python3 tools/cc.py <fg> <bg>` and `cc.hexof()`.
describe("parseOklch", () => {
  it("parses opaque colours", () => {
    expect(parseOklch("oklch(0.148 0.004 228.8)")).toEqual({ l: 0.148, c: 0.004, h: 228.8, alpha: 1 });
  });

  it("parses integer and fractional alpha percentages", () => {
    expect(parseOklch("oklch(1 0 0 / 15%)").alpha).toBeCloseTo(0.15, 12);
    expect(parseOklch("oklch(1 0 0 / 7.5%)").alpha).toBeCloseTo(0.075, 12);
    expect(parseOklch("oklch(0 0 0 / 0%)").alpha).toBe(0);
  });

  it.each(["rgb(0 0 0)", "oklch(1 0)", "oklch(1 0 0 / 150%)", "oklch(1.2.3 0 0)", "oklch(1 0 0 / %)", "{muted}"])(
    "rejects %s",
    (value) => {
      expect(() => parseOklch(value)).toThrow();
    },
  );
});

describe("oklchToLinear", () => {
  it("maps black and white", () => {
    expect(oklchToLinear({ l: 0, c: 0, h: 0 })).toEqual([0, 0, 0]);
    for (const channel of oklchToLinear({ l: 1, c: 0, h: 0 })) expect(channel).toBeCloseTo(1, 3);
  });

  it("clamps out-of-gamut colours per channel in linear light", () => {
    const rgb = oklchToLinear({ l: 0.7, c: 0.4, h: 150 });
    for (const channel of rgb) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(1);
    }
    expect(toHex(rgb, false)).toBe("#00d600");
  });
});

describe("contrast", () => {
  it.each([
    ["oklch(0.5 0.1 160)", "oklch(1 0 0)", 5.700208960375339],
    ["oklch(1 0 0 / 15%)", "oklch(0.148 0.004 228.8)", 1.480139854933198],
    ["oklch(0 0 0 / 30%)", "oklch(1 0 0)", 2.1084827955159273],
    ["oklch(0.7 0.4 150)", "oklch(0.2 0.02 250)", 9.13375195185183],
  ])("%s on %s is %d", (foreground, background, expected) => {
    expect(contrast(foreground, background)).toBeCloseTo(expected, 10);
  });

  it("composites a translucent foreground over the background", () => {
    expect(contrast("oklch(0 0 0 / 0%)", "oklch(0.5 0.1 160)")).toBeCloseTo(1, 12);
  });
});

describe("flatten and toHex", () => {
  it("composites translucent colours over white unless told otherwise", () => {
    expect(toHex(flatten(parseOklch("oklch(0 0 0 / 100%)")))).toBe("#000000");
    expect(toHex(flatten(parseOklch("oklch(0 0 0 / 0%)")))).toBe("#FFFFFF");
    expect(toHex(flatten(parseOklch("oklch(0 0 0 / 0%)"), oklchToLinear(parseOklch("oklch(0.55 0.15 160)"))))).toBe(
      "#008B52",
    );
  });

  it("formats hex in upper or lower case", () => {
    const rgb = oklchToLinear(parseOklch("oklch(0.985 0 0)"));
    expect(toHex(rgb)).toBe("#FAFAFA");
    expect(toHex(rgb, false)).toBe("#fafafa");
    expect(toHex(WHITE)).toBe("#FFFFFF");
  });
});
