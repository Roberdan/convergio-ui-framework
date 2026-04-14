import { Suspense, createElement } from "react";
import type { PageConfig, PageBlock } from "@/types";
import { getBlock } from "@/lib/block-registry";

/**
 * Page Renderer — transforms a PageConfig into rendered UI.
 *
 * All block components are loaded from the dynamic block registry
 * (see src/lib/block-registry.ts). No block types are hardcoded here.
 *
 * To register blocks, import block-registrations.ts in your layout:
 * ```ts
 * import "@/lib/block-registrations";
 * ```
 */

/** Map column count to responsive Tailwind grid classes (mobile-first) */
function gridClasses(columns: number): string {
  const base = "grid grid-cols-1 gap-4";
  if (columns <= 1) return base;
  if (columns === 2) return `${base} md:grid-cols-2`;
  if (columns === 3) return `${base} sm:grid-cols-2 lg:grid-cols-3`;
  return `${base} sm:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)}`;
}

export function PageRenderer({ config }: { config: PageConfig }) {
  return (
    <div className="space-y-6">
      <div>
        <h1>{config.title}</h1>
        {config.description && (
          <p className="text-caption mt-1">{config.description}</p>
        )}
      </div>
      {config.rows.map((row, ri) => (
        <div key={ri} className={gridClasses(row.columns)}>
          {row.blocks.map((block, bi) => (
            <BlockRenderer key={bi} block={block} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Fallback shown while a lazy block component is loading. */
function BlockFallback() {
  return (
    <div className="animate-pulse rounded-lg bg-[var(--mn-surface-sunken)] h-32" />
  );
}

function BlockRenderer({ block }: { block: PageBlock }) {
  const Component = getBlock(block.type);
  if (!Component) {
    console.warn(`[PageRenderer] Unknown block type: "${block.type}". Is the component installed and registered?`);
    return null;
  }
  return (
    <Suspense fallback={<BlockFallback />}>
      {createElement(Component, block)}
    </Suspense>
  );
}
