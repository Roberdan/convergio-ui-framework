#!/usr/bin/env npx tsx
/**
 * Generate .mdx documentation files for all Maranello components.
 *
 * Reads:
 *   - src/lib/component-catalog-data.ts   (catalog metadata)
 *   - src/components/maranello/<filePath>  (props interface)
 *
 * Writes:
 *   - docs/components/<category>/<slug>.mdx
 *
 * Usage:  npx tsx scripts/generate-component-docs.ts [--force]
 *
 * By default, preserves manually edited files (those with inline code examples
 * containing more than a single JSX tag). Pass --force to overwrite all.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { CatalogEntry, PropInfo } from "./generate-component-docs.helpers";
import { extractProps, a11yNotes } from "./generate-component-docs.helpers";
import { CURATED_EXAMPLES_A } from "./curated-examples-a";
import { CURATED_EXAMPLES_B } from "./curated-examples-b";
import { CURATED_EXAMPLES_C } from "./curated-examples-c";

// ── paths ──────────────────────────────────────────────────────────
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const CATALOG_PATH = path.join(ROOT, "src/lib/component-catalog-data.ts");
const COMPONENTS_DIR = path.join(ROOT, "src/components/maranello");
const DOCS_DIR = path.join(ROOT, "docs/components");
const FORCE = process.argv.includes("--force");

const CURATED_EXAMPLES: Record<string, string> = {
  ...CURATED_EXAMPLES_A,
  ...CURATED_EXAMPLES_B,
  ...CURATED_EXAMPLES_C,
};

// ── parse catalog ──────────────────────────────────────────────────
function parseCatalog(): CatalogEntry[] {
  const src = fs.readFileSync(CATALOG_PATH, "utf-8");
  const entries: CatalogEntry[] = [];

  const cCallRe =
    /c\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*\n?\s*"([^"]+)"\s*,\s*\n?\s*"([^"]+)"\s*,\s*\n?\s*\[([^\]]+)\]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = cCallRe.exec(src)) !== null) {
    const [, name, slug, category, description, whenToUse, kwRaw] = m;
    const keywords = kwRaw
      .split(",")
      .map((k) => k.trim().replace(/^"|"$/g, ""));
    entries.push({
      name, slug, category, description, keywords, whenToUse,
      filePath: `${category}/${slug}.tsx`,
      propsInterface: `${name}Props`,
    });
  }

  const litRe =
    /\{\s*name:\s*"([^"]+)"\s*,\s*slug:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*\n?\s*description:\s*"([^"]+)"\s*,\s*\n?\s*whenToUse:\s*"([^"]+)"\s*,\s*\n?\s*filePath:\s*"([^"]+)"\s*,\s*propsInterface:\s*"([^"]+)"\s*,\s*\n?\s*keywords:\s*\[([^\]]+)\]\s*\}/g;
  while ((m = litRe.exec(src)) !== null) {
    const [, name, slug, category, description, whenToUse, filePath, propsInterface, kwRaw] = m;
    const keywords = kwRaw
      .split(",")
      .map((k) => k.trim().replace(/^"|"$/g, ""));
    entries.push({
      name, slug, category, description, keywords, whenToUse,
      filePath, propsInterface,
    });
  }

  return entries;
}

// ── generate example code ──────────────────────────────────────────

function generateExample(entry: CatalogEntry, props: PropInfo[]): string {
  // Use curated example if available
  if (CURATED_EXAMPLES[entry.slug]) {
    return CURATED_EXAMPLES[entry.slug];
  }

  // Auto-generate a reasonable example
  const { name } = entry;
  const required = props.filter((p) => !p.optional && p.name !== "className");
  const propsStr: string[] = [];

  for (const p of required) {
    if (p.type.includes("[]")) propsStr.push(`${p.name}={[]}`);
    else if (p.type === "string") propsStr.push(`${p.name}="Example"`);
    else if (p.type === "number") propsStr.push(`${p.name}={0}`);
    else if (p.type === "boolean") propsStr.push(`${p.name}`);
    else if (p.type.startsWith("(")) propsStr.push(`${p.name}={() => {}}`);
    else propsStr.push(`${p.name}={/* ${p.type} */}`);
  }

  // Add a couple optional flavor props
  const sizeProp = props.find((p) => p.name === "size" && p.optional);
  if (sizeProp) propsStr.push(`size="md"`);
  const animProp = props.find((p) => p.name === "animate" && p.optional);
  if (animProp) propsStr.push(`animate`);

  const ps = propsStr.length > 0 ? "\n  " + propsStr.join("\n  ") + "\n" : " ";

  return `import { ${name} } from "@/components/maranello"\n\n<${name}${ps}/>`;
}

// ── format props table ─────────────────────────────────────────────
function propsTable(props: PropInfo[]): string {
  if (props.length === 0)
    return "_This component extends native HTML attributes. See source for full type details._\n";

  const lines: string[] = [
    "| Prop | Type | Default | Description |",
    "|------|------|---------|-------------|",
  ];

  for (const p of props) {
    const escapedType = p.type
      .replace(/\|/g, "\\|")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    lines.push(`| \`${p.name}\` | \`${escapedType}\` | ${p.defaultValue} | ${p.description} |`);
  }

  return lines.join("\n");
}

// ── generate .mdx content ──────────────────────────────────────────
function generateMdx(entry: CatalogEntry, props: PropInfo[]): string {
  const kw = entry.keywords.map((k) => `"${k}"`).join(", ");

  return `---
title: ${entry.name}
category: ${entry.category}
description: "${entry.description}"
keywords: [${kw}]
---

# ${entry.name}

${entry.description}.

## When to use

${entry.whenToUse}.

## Props

${propsTable(props)}

## Example

\`\`\`tsx
${generateExample(entry, props)}
\`\`\`

## Accessibility

${a11yNotes(entry)}
`;
}

// ── check if a file was manually edited ────────────────────────────
function isManuallyEdited(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, "utf-8");
  // Manually edited files have multi-line examples, type annotations, etc.
  const codeBlocks = content.match(/```tsx[\s\S]*?```/g) || [];
  for (const block of codeBlocks) {
    const lines = block.split("\n").filter((l) => l.trim() && !l.startsWith("```"));
    if (lines.length > 5) return true; // More than 5 lines of code = manually edited
  }
  return false;
}

// ── main ───────────────────────────────────────────────────────────
function main() {
  const entries = parseCatalog();
  console.log(`Parsed ${entries.length} catalog entries`);

  let generated = 0;
  let skipped = 0;
  let preserved = 0;

  for (const entry of entries) {
    const outDir = path.join(DOCS_DIR, entry.category);
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${entry.slug}.mdx`);

    // Preserve manually edited files unless --force
    if (!FORCE && isManuallyEdited(outFile)) {
      console.log(`  ✓  Preserved (manually edited): ${entry.slug}.mdx`);
      preserved++;
      continue;
    }

    const sourceFile = path.join(COMPONENTS_DIR, entry.filePath);
    const props = extractProps(sourceFile, entry.propsInterface);

    if (!fs.existsSync(sourceFile)) {
      console.warn(`  ⚠  Source not found: ${entry.filePath}`);
      skipped++;
    }

    const mdx = generateMdx(entry, props);
    fs.writeFileSync(outFile, mdx, "utf-8");
    generated++;
  }

  console.log(`\n✅ Generated ${generated} .mdx files`);
  if (preserved > 0) console.log(`✓  Preserved ${preserved} manually edited files`);
  if (skipped > 0) console.log(`⚠  ${skipped} source files not found`);

  const count = fs
    .readdirSync(DOCS_DIR, { recursive: true })
    .filter((f) => String(f).endsWith(".mdx")).length;
  console.log(`📁 Total .mdx files in docs/components: ${count}`);
}

main();
