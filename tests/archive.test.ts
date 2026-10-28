import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { androidArchive, slintArchive, tarGz } from "../src/emit/archive.ts";

const dir = mkdtempSync(join(tmpdir(), "patina-tar-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Unpacks with the system tar, the way a consumer would. */
function unpack(archive: Buffer, name: string): { listing: string; out: string } {
  const file = join(dir, `${name}.tar.gz`);
  const out = join(dir, name);
  writeFileSync(file, archive);
  execFileSync("mkdir", ["-p", out]);
  execFileSync("tar", ["xzf", file, "-C", out]);
  return { listing: execFileSync("tar", ["tzf", file], { encoding: "utf8" }), out };
}

describe("tarGz", () => {
  const files = {
    "patina/patina.slint": 'export { A } from "a.slint";\n',
    "patina/components/a.slint": "export component A inherits Rectangle {}\n".repeat(40),
    "patina/empty.slint": "",
    "patina/unicode.slint": "// 한글 ⌘\n",
  };

  it("unpacks with the system tar to the same bytes", () => {
    const { out } = unpack(tarGz(files), "round-trip");
    for (const [path, text] of Object.entries(files)) {
      expect(readFileSync(join(out, path), "utf8")).toBe(text);
    }
  });

  it("lists the entries in sorted order", () => {
    const { listing } = unpack(tarGz(files), "listing");
    expect(listing.trim().split("\n")).toEqual(Object.keys(files).sort());
  });

  it("is deterministic", () => {
    expect(tarGz(files).equals(tarGz({ ...files }))).toBe(true);
    const reordered = Object.fromEntries(Object.entries(files).reverse());
    expect(tarGz(reordered).equals(tarGz(files))).toBe(true);
  });

  it("writes the same gzip header on every machine", () => {
    // magic, deflate, no flags, mtime 0, best compression, OS unix; zlib would write the host OS (19 on macOS) here
    expect([...tarGz(files).subarray(0, 10)]).toEqual([0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 2, 3]);
  });

  it("rejects a path that does not fit a ustar header", () => {
    expect(() => tarGz({ [`patina/${"x".repeat(120)}.slint`]: "" })).toThrow(/longer than 100/);
  });
});

describe("slintArchive", () => {
  it("packs only the .slint files below slint/, under patina/", () => {
    const { listing } = unpack(
      slintArchive({
        "slint/patina.slint": "a",
        "slint/tokens.slint": "b",
        "slint/components/button.slint": "c",
        "r/base.json": "{}",
        "android/patina/theme/Color.kt": "d",
      }),
      "slint",
    );
    expect(listing.trim().split("\n")).toEqual([
      "patina/components/button.slint",
      "patina/patina.slint",
      "patina/tokens.slint",
    ]);
  });
});

describe("androidArchive", () => {
  it("packs only the Kotlin files below android/, and keeps their path under patina/", () => {
    const { listing } = unpack(
      androidArchive({
        "android/patina/theme/Color.kt": "a",
        "android/patina/ui/PatinaButton.kt": "b",
        "android/patina-android.tar.gz": "not a source",
        "slint/patina.slint": "c",
      }),
      "android",
    );
    expect(listing.trim().split("\n")).toEqual(["patina/theme/Color.kt", "patina/ui/PatinaButton.kt"]);
  });
});
