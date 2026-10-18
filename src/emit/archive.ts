// A deterministic .tar.gz (ustar format, no dependencies) so a multi-file library can be fetched with one request:
// `curl -L <url> | tar xz -C ui`. Same input, same bytes: sorted entries, mtime 0, fixed owner and mode.

import { gzipSync } from "node:zlib";

const BLOCK = 512;
const GZIP_OS_BYTE = 9; // the last byte of the 10-byte gzip header
const GZIP_OS_UNIX = 3;

function field(text: string, length: number): Buffer {
  const buffer = Buffer.alloc(length);
  buffer.write(text, 0, length, "utf8");
  return buffer;
}

function octal(value: number, length: number): Buffer {
  return field(`${value.toString(8).padStart(length - 1, "0")}\0`, length);
}

function header(path: string, size: number): Buffer {
  if (Buffer.byteLength(path) > 100) throw new Error(`tar path longer than 100 bytes: ${path}`);
  const block = Buffer.alloc(BLOCK);
  field(path, 100).copy(block, 0);
  octal(0o644, 8).copy(block, 100);
  octal(0, 8).copy(block, 108); // uid
  octal(0, 8).copy(block, 116); // gid
  octal(size, 12).copy(block, 124);
  octal(0, 12).copy(block, 136); // mtime
  block.fill(0x20, 148, 156); // the checksum counts these eight bytes as spaces
  block.write("0", 156); // a regular file
  block.write("ustar\0", 257);
  block.write("00", 263);
  const sum = block.reduce((total, byte) => total + byte, 0);
  field(`${sum.toString(8).padStart(6, "0")}\0 `, 8).copy(block, 148);
  return block;
}

/** `files` maps archive paths (`patina/patina.slint`) to text; the result is the gzipped tar. */
export function tarGz(files: Record<string, string>): Buffer {
  const parts: Buffer[] = [];
  for (const path of Object.keys(files).sort()) {
    const body = Buffer.from(files[path] ?? "", "utf8");
    parts.push(header(path, body.length), body, Buffer.alloc((BLOCK - (body.length % BLOCK)) % BLOCK));
  }
  parts.push(Buffer.alloc(BLOCK * 2)); // end of archive
  const gz = gzipSync(Buffer.concat(parts), { level: 9 });
  gz[GZIP_OS_BYTE] = GZIP_OS_UNIX; // zlib writes the host OS here (3 on Linux, 19 on macOS), which would change the bytes per machine
  return gz;
}

/** The Slint library as an archive that unpacks to `patina/…`; only the files below `slint/`. */
export function slintArchive(files: Record<string, string>): Buffer {
  const entries = Object.entries(files)
    .filter(([path]) => path.startsWith("slint/") && path.endsWith(".slint"))
    .map(([path, text]): [string, string] => [`patina/${path.slice("slint/".length)}`, text]);
  return tarGz(Object.fromEntries(entries));
}

/** The Android library (generated and hand-written Kotlin) as an archive that unpacks to `patina/…`. */
export function androidArchive(files: Record<string, string>): Buffer {
  const entries = Object.entries(files)
    .filter(([path]) => path.startsWith("android/") && path.endsWith(".kt"))
    .map(([path, text]): [string, string] => [`patina/${path.slice("android/".length)}`, text]);
  return tarGz(Object.fromEntries(entries));
}
