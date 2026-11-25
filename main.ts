// Sum up 25 November's world news in one image: the repository holds the
// finished front-page illustration as asset.jpg — Zelenskiy's confirmation
// of the strike on a Russian ship and Moscow's "terrorism" accusation, the
// CIA/ODNI cyberattack reported by CNN, the COP31 collapse in Antalya, and
// Pakistan's first astronaut aboard Shenzhou-24 — and this program copies it
// to entry.png in the output directory (the file is a JPEG, which the rules
// allow: the name stays entry.png and the format is told by its first
// bytes). The four stories were verified across Reuters, AP, CNN and AFP
// before the page was drawn, and the date on the masthead is the day the
// page sums up: Wednesday 25 November 2026.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const JPEG_SOI = 0xffd8;
const JPEG_EOI = 0xffd9;

function readFrontPage(here: string): Buffer {
  const source = join(here, "asset.jpg");
  if (!existsSync(source)) {
    throw new Error("asset.jpg is missing from the entry");
  }
  const bytes = readFileSync(source);
  if (bytes.length > MAX_BYTES) {
    throw new Error(`asset.jpg is ${bytes.length} bytes, over the 1 MiB limit`);
  }
  if (bytes.length < 4) {
    throw new Error("asset.jpg is too small to be a whole JPEG");
  }
  const start = bytes.readUInt16BE(0);
  const end = bytes.readUInt16BE(bytes.length - 2);
  if (start !== JPEG_SOI || end !== JPEG_EOI) {
    throw new Error("asset.jpg is not a whole JPEG (bad magic or end marker)");
  }
  return bytes;
}

function main(): void {
  const here = fileURLToPath(new URL(".", import.meta.url));
  const bytes = readFrontPage(here);
  const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "entry.png"), bytes, { mode: 0o644 });
  console.log(`wrote entry.png (${bytes.length} bytes)`);
}

main();
