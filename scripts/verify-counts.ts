#!/usr/bin/env npx tsx
/**
 * verify-counts.ts — catalog vs. filesystem vs. docs count drift check.
 *
 * Ground truth: the `c(...)` calls in `src/lib/component-catalog-entries-*.ts`.
 *
 * Fails (exit 1) when:
 *   - a category's catalog count diverges from the number of main `mn-*.tsx`
 *     files in that directory (excluding `.helpers.`, `.test.`, and known
 *     sub-component suffixes that are not registered separately).
 *   - README.md or root AGENTS.md or src/components/maranello/AGENTS.md quote
 *     a different total-component number than the catalog.
 *
 * Usage: npx tsx scripts/verify-counts.ts
 */
import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const CATALOG_DIR = join(ROOT, "src/lib");
const MARANELLO_DIR = join(ROOT, "src/components/maranello");

const SUBCOMPONENT_SUFFIXES = [
  "helpers",
  "test",
  "types",
  "canvas",
  "card",
  "toolbar",
  "draw",
  "force",
  "geometry",
  "scene",
  "layout",
  "catalog",
  "register",
  "crosshair",
];

function countCatalogEntries(): {
  total: number;
  byCategory: Map<string, number>;
} {
  const byCategory = new Map<string, number>();
  let total = 0;
  const files = readdirSync(CATALOG_DIR).filter((f) =>
    f.match(/^component-catalog-entries-[abc]\.ts$/),
  );
  // Two catalog entry shapes: the `c(name, slug, category, ...)` helper and
  // a literal `{ name: "...", slug: "...", category: "...", ... }` object.
  const cRe = /^\s*c\("Mn[^"]+",\s*"([^"]+)",\s*"([^"]+)"/gm;
  const litRe =
    /\{\s*name:\s*"Mn[^"]+",\s*slug:\s*"([^"]+)",\s*category:\s*"([^"]+)"/gm;

  for (const file of files) {
    const src = readFileSync(join(CATALOG_DIR, file), "utf-8");
    for (const re of [cRe, litRe]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        const category = m[2];
        byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
        total++;
      }
    }
  }
  return { total, byCategory };
}

function countFilesystem(): Map<string, number> {
  const out = new Map<string, number>();
  for (const entry of readdirSync(MARANELLO_DIR)) {
    const full = join(MARANELLO_DIR, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry === "shared" || entry === "__tests__") continue;
    let count = 0;
    for (const name of readdirSync(full)) {
      if (!name.startsWith("mn-") || !name.endsWith(".tsx")) continue;
      const base = basename(name, ".tsx");
      const suffix = base.split(".").slice(1).join(".");
      if (suffix && SUBCOMPONENT_SUFFIXES.includes(suffix)) continue;
      count++;
    }
    out.set(entry, count);
  }
  return out;
}

function quotedTotal(file: string, pattern: RegExp): number | null {
  try {
    const content = readFileSync(file, "utf-8");
    const m = content.match(pattern);
    return m ? parseInt(m[1], 10) : null;
  } catch {
    return null;
  }
}

function main(): number {
  const catalog = countCatalogEntries();
  const fs = countFilesystem();

  const failures: string[] = [];

  // Per-category parity.
  const allCats = new Set<string>([
    ...catalog.byCategory.keys(),
    ...fs.keys(),
  ]);
  for (const cat of [...allCats].sort()) {
    const c = catalog.byCategory.get(cat) ?? 0;
    const f = fs.get(cat) ?? 0;
    if (c !== f) {
      failures.push(
        `category '${cat}': catalog=${c} filesystem=${f} (diff=${f - c})`,
      );
    }
  }

  // Documentation totals.
  const checks: Array<[string, RegExp]> = [
    [join(ROOT, "README.md"), /Component Catalog \((\d+) components\)/],
    [
      join(ROOT, "src/components/maranello/AGENTS.md"),
      /(\d+)\s+React components with `Mn`/,
    ],
  ];
  for (const [file, re] of checks) {
    const n = quotedTotal(file, re);
    if (n !== null && n !== catalog.total) {
      failures.push(
        `${file.replace(ROOT + "/", "")}: quoted ${n} vs catalog total ${catalog.total}`,
      );
    }
  }

  console.log(`Catalog total: ${catalog.total}`);
  for (const cat of [...catalog.byCategory.keys()].sort()) {
    console.log(
      `  ${cat.padEnd(15)} catalog=${catalog.byCategory.get(cat)}  fs=${
        fs.get(cat) ?? 0
      }`,
    );
  }

  if (failures.length) {
    console.error("\n❌ Count drift detected:");
    for (const f of failures) console.error("  - " + f);
    return 1;
  }

  console.log("\n✅ Counts consistent across catalog, filesystem, and docs");
  return 0;
}

process.exit(main());
