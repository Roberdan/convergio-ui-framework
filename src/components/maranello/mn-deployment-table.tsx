'use client';

import { cn } from '@/lib/utils';
import { useCallback, useMemo, useState } from 'react';

export interface Deployment {
  node: string;
  version: string;
  status: 'deployed' | 'rolling' | 'failed' | 'pending';
  timestamp: string;
  hash: string;
}

export interface MnDeploymentTableProps {
  deployments: Deployment[];
  ariaLabel?: string;
  className?: string;
}

type SortKey = 'node' | 'version' | 'status' | 'timestamp';
type SortDir = 'asc' | 'desc';

const STATUS_BADGE: Record<string, string> = {
  deployed: 'bg-status-success/20 text-status-success',
  rolling: 'bg-status-warning/20 text-status-warning',
  failed: 'bg-status-error/20 text-status-error',
  pending: 'bg-muted text-muted-foreground',
};

const STATUS_LABEL: Record<string, string> = {
  deployed: 'Deployed',
  rolling: 'Rolling',
  failed: 'Failed',
  pending: 'Pending',
};

function formatTs(ts: string): string {
  try {
    return new Date(ts).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

/**
 * Sortable deployment table with status badges.
 *
 * Columns: node, version, status, timestamp, hash (truncated).
 * Click column headers to sort. Fully keyboard accessible.
 */
export function MnDeploymentTable({
  deployments,
  ariaLabel = 'Deployments',
  className,
}: MnDeploymentTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey],
  );

  const sorted = useMemo(() => {
    const copy = [...deployments];
    const dir = sortDir === 'asc' ? 1 : -1;
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      return va < vb ? -dir : va > vb ? dir : 0;
    });
    return copy;
  }, [deployments, sortKey, sortDir]);

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return ' \u2195';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  if (!deployments.length) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground', className)}>
        No deployments to display.
      </div>
    );
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'node', label: 'Node' },
    { key: 'version', label: 'Version' },
    { key: 'status', label: 'Status' },
    { key: 'timestamp', label: 'Time' },
  ];

  return (
    <div className={cn('rounded-lg border bg-card overflow-auto', className)}>
      <table
        className="w-full text-sm"
        aria-label={ariaLabel}
      >
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-2.5 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-card-foreground transition-colors"
                onClick={() => handleSort(col.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort(col.key);
                  }
                }}
                tabIndex={0}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                {col.label}
                <span aria-hidden="true">{sortIcon(col.key)}</span>
              </th>
            ))}
            <th
              scope="col"
              className="px-4 py-2.5 text-left font-medium text-muted-foreground"
            >
              Hash
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((d, i) => (
            <tr
              key={`${d.node}-${d.hash}-${i}`}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-2.5 font-medium text-card-foreground">
                {d.node}
              </td>
              <td className="px-4 py-2.5 text-card-foreground">
                {d.version}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                    STATUS_BADGE[d.status] ?? STATUS_BADGE.pending,
                  )}
                >
                  {STATUS_LABEL[d.status] ?? d.status}
                </span>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {formatTs(d.timestamp)}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                {d.hash.slice(0, 8)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
