'use client';

import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';

export interface CanvasSegment {
  label: string;
  items: string[];
}

export interface MnStrategyCanvasProps {
  /** 9 segments for Business Model Canvas (or any count) */
  segments: CanvasSegment[];
  /** Called when segments change */
  onChange?: (segments: CanvasSegment[]) => void;
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

/**
 * Business Model Canvas / Strategy Canvas.
 *
 * Grid layout with editable items per segment.
 * Click-to-add/remove items, no drag. Keyboard accessible.
 */
export function MnStrategyCanvas({
  segments,
  onChange,
  ariaLabel = 'Strategy Canvas',
  className,
}: MnStrategyCanvasProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  const addItem = useCallback(
    (segIdx: number) => {
      if (!draft.trim()) return;
      const next = segments.map((s, i) =>
        i === segIdx ? { ...s, items: [...s.items, draft.trim()] } : s,
      );
      onChange?.(next);
      setDraft('');
      setEditingIdx(null);
    },
    [segments, onChange, draft],
  );

  const removeItem = useCallback(
    (segIdx: number, itemIdx: number) => {
      const next = segments.map((s, i) =>
        i === segIdx
          ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) }
          : s,
      );
      onChange?.(next);
    },
    [segments, onChange],
  );

  if (!segments.length) return null;

  /* BMC canonical layout: 3x3 with spanning cells */
  const isBmc = segments.length === 9;
  const gridClass = isBmc
    ? 'grid-cols-5 grid-rows-[auto_1fr_1fr_auto]'
    : `grid-cols-${Math.min(segments.length, 4)}`;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn('grid gap-px bg-border rounded-lg overflow-hidden', gridClass, className)}
    >
      {segments.map((seg, si) => {
        /* BMC spanning: row 4 = cost (cols 1-2), revenue (cols 3-5) */
        const spanClass = isBmc ? bmcSpan(si) : '';
        return (
          <div
            key={seg.label}
            className={cn(
              'bg-card p-3 flex flex-col gap-2 min-h-[8rem]',
              spanClass,
            )}
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {seg.label}
            </h3>
            <ul className="flex flex-wrap gap-1" aria-label={`${seg.label} items`}>
              {seg.items.map((item, ii) => (
                <li key={`${item}-${ii}`} className="group flex items-center">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                    {item}
                    {onChange && (
                      <button
                        type="button"
                        onClick={() => removeItem(si, ii)}
                        className="ml-0.5 text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
                        aria-label={`Remove ${item} from ${seg.label}`}
                      >
                        &times;
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {onChange && (
              editingIdx === si ? (
                <form
                  className="flex gap-1 mt-auto"
                  onSubmit={(e) => { e.preventDefault(); addItem(si); }}
                >
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="flex-1 rounded border bg-background px-2 py-0.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    placeholder="New item..."
                    aria-label={`Add item to ${seg.label}`}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingIdx(null); setDraft(''); }}
                    className="text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-1"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingIdx(si)}
                  className="mt-auto self-start text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-1"
                  aria-label={`Add item to ${seg.label}`}
                >
                  + Add
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

/** BMC grid placement for canonical 9-block layout */
function bmcSpan(idx: number): string {
  const spans: Record<number, string> = {
    0: 'col-start-1 row-start-1 row-span-2', // Key Partners
    1: 'col-start-2 row-start-1',             // Key Activities
    2: 'col-start-2 row-start-2',             // Key Resources
    3: 'col-start-3 row-start-1 row-span-2', // Value Propositions
    4: 'col-start-4 row-start-1',             // Customer Relationships
    5: 'col-start-4 row-start-2',             // Channels
    6: 'col-start-5 row-start-1 row-span-2', // Customer Segments
    7: 'col-start-1 col-span-2 row-start-3', // Cost Structure
    8: 'col-start-3 col-span-3 row-start-3', // Revenue Streams
  };
  return spans[idx] ?? '';
}
