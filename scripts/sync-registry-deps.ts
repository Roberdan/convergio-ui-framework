/**
 * Sync component dependency graph to registry JSON files.
 *
 * 1. Scans all Maranello components for cross-deps (like scan-deps.ts)
 * 2. Filters out internal helpers (.helpers.ts, .types.ts, etc.)
 * 3. Updates public/r/*.json registryDependencies arrays
 * 4. Outputs a summary of changes
 *
 * Usage: npx tsx scripts/sync-registry-deps.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = process.cwd();
const MARANELLO_DIR = join(ROOT, "src", "components", "maranello");
const REGISTRY_DIR = join(ROOT, "public", "r");

/** Recursively find component source files */
function findSources(dir: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      result.push(...findSources(full));
    } else if ((entry.endsWith(".tsx") || entry.endsWith(".ts")) &&
               !entry.endsWith(".test.tsx") && !entry.endsWith(".test.ts") &&
               entry !== "index.ts" && entry.startsWith("mn-")) {
      result.push(full);
    }
  }
  return result;
}

function toSlug(filePath: string): string {
  return basename(filePath).replace(/\.tsx?$/, "");
}

/** Check if a slug is an internal helper/types file */
function isInternalHelper(slug: string): boolean {
  return /\.(helpers|types|layout|scene|geometry|draw|force|canvas|card|toolbar|catalog)$/.test(slug);
}

/** Extract Maranello cross-deps from a file */
function extractDeps(filePath: string, selfSlug: string): string[] {
  const content = readFileSync(filePath, "utf-8");
  const deps = new Set<string>();

  // Relative imports within maranello
  const relRegex = /from\s+["'](?:\.\.?\/[^"']*)["']/g;
  let match;
  while ((match = relRegex.exec(content)) !== null) {
    const importPath = match[0].replace(/from\s+["']/, "").replace(/["']$/, "");
    const parts = importPath.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart.startsWith("mn-") && lastPart !== selfSlug) {
      deps.add(lastPart);
    }
  }

  // Barrel imports
  const barrelRegex = /import\s*\{([^}]+)\}\s*from\s*["']@\/components\/maranello["']/g;
  while ((match = barrelRegex.exec(content)) !== null) {
    const names = match[1].split(",").map(s => s.trim().split(" as ")[0].trim());
    for (const name of names) {
      const slug = name.replace(/^Mn/, "mn-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      if (slug !== selfSlug) deps.add(slug);
    }
  }

  return [...deps];
}

// Build the raw dependency graph
const allFiles = findSources(MARANELLO_DIR);
const rawGraph: Record<string, string[]> = {};
for (const file of allFiles) {
  const slug = toSlug(file);
  rawGraph[slug] = extractDeps(file, slug);
}

// For each main component (not a helper), compute the transitive closure
// of deps that are OTHER main components
function resolvePublicDeps(slug: string): string[] {
  const visited = new Set<string>();
  const publicDeps = new Set<string>();

  function walk(s: string) {
    if (visited.has(s)) return;
    visited.add(s);
    const deps = rawGraph[s] ?? [];
    for (const dep of deps) {
      if (!isInternalHelper(dep) && dep !== slug) {
        publicDeps.add(dep);
      }
      walk(dep);
    }
  }

  walk(slug);
  return [...publicDeps].sort();
}

// Get all main components (not helpers)
const mainComponents = Object.keys(rawGraph)
  .filter(s => !isInternalHelper(s))
  .sort();

// Build the public dependency map
const depMap: Record<string, string[]> = {};
for (const slug of mainComponents) {
  depMap[slug] = resolvePublicDeps(slug);
}

// Update registry JSONs
let updated = 0;
let unchanged = 0;
const registryFiles = readdirSync(REGISTRY_DIR).filter(f => f.endsWith(".json"));

for (const file of registryFiles) {
  const filePath = join(REGISTRY_DIR, file);
  const json = JSON.parse(readFileSync(filePath, "utf-8"));
  const slug = file.replace(".json", "");

  const newDeps = depMap[slug] ?? [];
  const oldDeps = json.registryDependencies ?? [];

  if (JSON.stringify(newDeps) !== JSON.stringify(oldDeps)) {
    json.registryDependencies = newDeps;
    writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n");
    updated++;
    if (newDeps.length > 0) {
      console.log(`  ${slug}: ${newDeps.join(", ")}`);
    }
  } else {
    unchanged++;
  }
}

console.log(`\n${mainComponents.length} main components analyzed`);
console.log(`${updated} registry files updated, ${unchanged} unchanged`);

// Output the dep map as JSON for T2-02 (catalog update)
const outputPath = join(ROOT, "scripts", "dep-graph.json");
writeFileSync(outputPath, JSON.stringify(depMap, null, 2) + "\n");
console.log(`\nDependency graph saved to scripts/dep-graph.json`);

// Summary: components with real cross-deps
const withDeps = Object.entries(depMap).filter(([, d]) => d.length > 0);
console.log(`\n${withDeps.length} components with cross-dependencies:`);
for (const [slug, deps] of withDeps) {
  console.log(`  ${slug} → ${deps.join(", ")}`);
}
