import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/lib/component-catalog-data';

function collectTsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...collectTsxFiles(full));
    else if (full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

describe('showcase coverage', () => {
  it('includes every catalog component in at least one showcase example', () => {
    const showcaseRoot = resolve(process.cwd(), 'src/app/(dashboard)/showcase');
    const files = collectTsxFiles(showcaseRoot);
    const used = new Set<string>();

    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(/entry\('([^']+)'\)/g)) {
        used.add(match[1]);
      }
    }

    const missing = CATALOG.map((entry) => entry.slug).filter((slug) => !used.has(slug));
    expect(missing).toEqual([]);
  });
});
