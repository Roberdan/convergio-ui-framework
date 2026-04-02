'use client';

import { cn } from '@/lib/utils';
import { useCallback, useMemo, useState } from 'react';

export interface DecisionCriterion {
  name: string;
  weight: number;
}

export interface DecisionOption {
  name: string;
  /** One score per criterion, same order */
  scores: number[];
}

export interface MnDecisionMatrixProps {
  criteria: DecisionCriterion[];
  options: DecisionOption[];
  /** Accessible label */
  ariaLabel?: string;
  className?: string;
}

interface ScoredOption {
  option: DecisionOption;
  weightedScores: number[];
  total: number;
  isWinner: boolean;
}

/**
 * Weighted criteria decision matrix.
 *
 * Table with weighted scores per criterion, sortable by total.
 * Winner row is highlighted. Keyboard accessible, screen-reader friendly.
 */
export function MnDecisionMatrix({
  criteria,
  options,
  ariaLabel = 'Decision matrix',
  className,
}: MnDecisionMatrixProps) {
  const [sortAsc, setSortAsc] = useState(false);

  const scored = useMemo((): ScoredOption[] => {
    const results = options.map((option) => {
      const weightedScores = option.scores.map(
        (s, i) => s * (criteria[i]?.weight ?? 1),
      );
      const total = weightedScores.reduce((a, b) => a + b, 0);
      return { option, weightedScores, total, isWinner: false };
    });

    const maxTotal = Math.max(...results.map((r) => r.total));
    for (const r of results) {
      if (r.total === maxTotal) r.isWinner = true;
    }

    results.sort((a, b) => (sortAsc ? a.total - b.total : b.total - a.total));
    return results;
  }, [criteria, options, sortAsc]);

  const toggleSort = useCallback(() => setSortAsc((v) => !v), []);

  if (!criteria.length || !options.length) return null;

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);

  return (
    <div
      className={cn('rounded-lg border bg-card overflow-x-auto', className)}
    >
      <table
        className="w-full text-sm"
        aria-label={ariaLabel}
      >
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th scope="col" className="p-3 font-medium">
              Option
            </th>
            {criteria.map((c) => (
              <th
                key={c.name}
                scope="col"
                className="p-3 font-medium text-center"
              >
                <span>{c.name}</span>
                <span className="block text-[10px] opacity-70">
                  w={c.weight}
                </span>
              </th>
            ))}
            <th scope="col" className="p-3 font-medium text-right">
              <button
                type="button"
                onClick={toggleSort}
                onKeyDown={(e) => e.key === 'Enter' && toggleSort()}
                className="inline-flex items-center gap-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-1"
                aria-label={`Sort by total ${sortAsc ? 'descending' : 'ascending'}`}
              >
                Total
                <span aria-hidden="true">{sortAsc ? '\u25B2' : '\u25BC'}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {scored.map((row) => (
            <tr
              key={row.option.name}
              className={cn(
                'border-b last:border-0 transition-colors',
                row.isWinner
                  ? 'bg-primary/10 font-semibold'
                  : 'hover:bg-muted/50',
              )}
            >
              <td className="p-3">
                {row.option.name}
                {row.isWinner && (
                  <span className="ml-2 text-[10px] text-primary" aria-label="Winner">
                    BEST
                  </span>
                )}
              </td>
              {row.weightedScores.map((ws, i) => (
                <td
                  key={criteria[i].name}
                  className="p-3 text-center tabular-nums"
                  aria-label={`${criteria[i].name}: ${row.option.scores[i]} x ${criteria[i].weight} = ${ws.toFixed(1)}`}
                >
                  <span className="text-muted-foreground text-xs">
                    {row.option.scores[i]}
                  </span>
                  <span className="mx-1 text-muted-foreground/50">x</span>
                  <span>{ws.toFixed(1)}</span>
                </td>
              ))}
              <td className="p-3 text-right tabular-nums font-mono">
                {row.total.toFixed(1)}
                <span className="text-muted-foreground text-xs ml-1">
                  /{(10 * totalWeight).toFixed(0)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
