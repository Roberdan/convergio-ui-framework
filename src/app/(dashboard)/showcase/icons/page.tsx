'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllIcons } from '@/lib/icon-map';

export default function IconsPage() {
  const [filter, setFilter] = useState('');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const allIcons = useMemo(() => getAllIcons(), []);

  const filteredIcons = useMemo(
    () =>
      allIcons.filter(([name]) =>
        name.toLowerCase().includes(filter.toLowerCase()),
      ),
    [allIcons, filter],
  );

  const copyImport = useCallback((name: string) => {
    const text = `import { ${name} } from "lucide-react"`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 1500);
    });
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Link
          href="/showcase"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          All Categories
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Icons</h1>
        <p className="text-muted-foreground mt-1">
          Maranello uses Lucide icons exclusively. Zero emoji.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {allIcons.length} icons registered in the icon map.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter icons..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={cn(
            'w-full rounded-lg border bg-card py-2 pl-10 pr-4 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
          )}
        />
      </div>

      {/* Icon grid */}
      <section>
        <p className="text-sm text-muted-foreground mb-4">
          Click any icon to copy its import statement.
          {filter && ` Showing ${filteredIcons.length} of ${allIcons.length}.`}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredIcons.map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => copyImport(name)}
              className={cn(
                'group flex flex-col items-center gap-2 rounded-lg border bg-card p-4',
                'hover:border-primary/50 transition-colors text-center',
                copiedName === name && 'border-primary bg-primary/5',
              )}
            >
              <div className="relative">
                {copiedName === name ? (
                  <Check className="size-6 text-primary" />
                ) : (
                  <Icon className="size-6 text-foreground" />
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground truncate w-full">
                {copiedName === name ? 'Copied!' : name}
              </span>
            </button>
          ))}
        </div>
        {filteredIcons.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No icons match &ldquo;{filter}&rdquo;.
          </p>
        )}
      </section>

      {/* Usage guide */}
      <section className="rounded-lg border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Adding New Icons</h2>
        <p className="text-sm text-muted-foreground">
          To register a new Lucide icon, add its import and map entry in{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            src/lib/icon-map.ts
          </code>
          . See the full guide:{' '}
          <Link
            href="https://github.com/Roberdan/convergio-ui-framework/blob/main/docs/guides/adding-icons.md"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            docs/guides/adding-icons.md
          </Link>
        </p>
        <div className="rounded-md bg-muted p-3">
          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`// 1. Import in src/lib/icon-map.ts
import { NewIcon } from "lucide-react";

// 2. Add to the map
const iconMap = {
  ...
  NewIcon,
};`}
          </pre>
        </div>
      </section>
    </div>
  );
}
