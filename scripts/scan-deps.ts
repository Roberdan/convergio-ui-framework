/**
 * Scan all Maranello components for inter-component dependencies.
 * Output: JSON map { slug → [dep-slugs] }
 *
 * Usage: npx tsx scripts/scan-deps.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";

const MARANELLO_DIR = join(process.cwd(), "src", "components", "maranello");

/** Recursively find all .tsx files */
function findTsx(dir: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      result.push(...findTsx(full));
    } else if (entry.endsWith(".tsx") && !entry.endsWith(".test.tsx") && entry !== "index.ts") {
      result.push(full);
    }
  }
  return result;
}

/** Extract slug from file path: mn-gauge.tsx → mn-gauge */
function toSlug(filePath: string): string {
  return basename(filePath, ".tsx");
}

/** Extract Maranello imports from a file */
function extractMnImports(filePath: string): string[] {
  const content = readFileSync(filePath, "utf-8");
  const deps: string[] = [];

  // Match: import { X } from "../category/mn-something"
  // or: import { X } from "@/components/maranello/..."
  const importRegex = /from\s+["'](?:\.\.?\/[^"']*|@\/components\/maranello\/[^"']*)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[0].replace(/from\s+["']/, "").replace(/["']$/, "");
    // Extract the file slug from the import path
    const parts = importPath.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart.startsWith("mn-") && lastPart !== toSlug(filePath)) {
      deps.push(lastPart);
    }
  }

  // Also match barrel imports: from "@/components/maranello"
  // and extract which named exports are used
  const barrelRegex = /import\s*\{([^}]+)\}\s*from\s*["']@\/components\/maranello["']/g;
  while ((match = barrelRegex.exec(content)) !== null) {
    const names = match[1].split(",").map(s => s.trim().split(" as ")[0].trim());
    for (const name of names) {
      // Convert MnGauge → mn-gauge
      const slug = name.replace(/^Mn/, "mn-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      if (slug !== toSlug(filePath)) {
        deps.push(slug);
      }
    }
  }

  return [...new Set(deps)];
}

// Also scan helpers files (.helpers.tsx)
function findAllSources(dir: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      result.push(...findAllSources(full));
    } else if ((entry.endsWith(".tsx") || entry.endsWith(".ts")) && 
               !entry.endsWith(".test.tsx") && !entry.endsWith(".test.ts") &&
               entry !== "index.ts" && entry.startsWith("mn-")) {
      result.push(full);
    }
  }
  return result;
}

const allFiles = findAllSources(MARANELLO_DIR);
const depGraph: Record<string, string[]> = {};
let totalDeps = 0;

for (const file of allFiles) {
  const slug = toSlug(file);
  const deps = extractMnImports(file);
  depGraph[slug] = deps;
  if (deps.length > 0) totalDeps++;
}

// Sort by key
const sorted = Object.fromEntries(
  Object.entries(depGraph).sort(([a], [b]) => a.localeCompare(b))
);

console.log(JSON.stringify(sorted, null, 2));
console.error(`\nScanned ${allFiles.length} components, ${totalDeps} have Maranello dependencies.`);

// Also list components WITH deps
const withDeps = Object.entries(sorted).filter(([, d]) => d.length > 0);
if (withDeps.length > 0) {
  console.error("\nComponents with cross-dependencies:");
  for (const [slug, deps] of withDeps) {
    console.error(`  ${slug} → ${deps.join(", ")}`);
  }
}
