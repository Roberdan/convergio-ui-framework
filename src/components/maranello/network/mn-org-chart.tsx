'use client';

import { cn } from '@/lib/utils';
import { useCallback, useId, useMemo, useState } from 'react';

export interface OrgNode {
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'busy' | 'error';
  children?: OrgNode[];
}

export interface MnOrgChartProps {
  tree: OrgNode;
  /** Called when a node is clicked */
  onNodeClick?: (node: OrgNode) => void;
  ariaLabel?: string;
  className?: string;
}

const STATUS_COLORS: Record<OrgNode['status'], string> = {
  active: 'bg-status-success',
  inactive: 'bg-muted-foreground',
  busy: 'bg-status-warning',
  error: 'bg-status-error',
};

const STATUS_LABEL: Record<OrgNode['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  busy: 'Busy',
  error: 'Error',
};

interface FlatNode {
  node: OrgNode;
  depth: number;
  path: string;
  hasChildren: boolean;
}

/** Flatten tree for keyboard navigation order. */
function flattenTree(
  root: OrgNode,
  expanded: Set<string>,
  path = '0',
  depth = 0,
): FlatNode[] {
  const result: FlatNode[] = [];
  const hasChildren = !!root.children?.length;
  result.push({ node: root, depth, path, hasChildren });

  if (hasChildren && expanded.has(path)) {
    for (let i = 0; i < root.children!.length; i++) {
      result.push(...flattenTree(root.children![i], expanded, `${path}-${i}`, depth + 1));
    }
  }
  return result;
}

/** Render a single org chart node card. */
function NodeCard({
  node,
  isExpanded,
  hasChildren,
  onToggle,
  onClick,
  id,
  focused,
}: {
  node: OrgNode;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onClick: () => void;
  id: string;
  focused: boolean;
}) {
  return (
    <div
      id={id}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={focused}
      tabIndex={focused ? 0 : -1}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm',
        'cursor-pointer transition-colors hover:bg-muted/50',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        focused && 'ring-2 ring-ring',
      )}
      onClick={onClick}
      onDoubleClick={hasChildren ? onToggle : undefined}
    >
      {/* expand/collapse toggle */}
      {hasChildren && (
        <button
          type="button"
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          tabIndex={-1}
        >
          {isExpanded ? '\u25BC' : '\u25B6'}
        </button>
      )}

      {/* status badge */}
      <span
        className={cn('h-2.5 w-2.5 shrink-0 rounded-full', STATUS_COLORS[node.status])}
        aria-label={`Status: ${STATUS_LABEL[node.status]}`}
      />

      <div className="min-w-0">
        <span className="font-medium text-card-foreground">{node.name}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">{node.role}</span>
      </div>
    </div>
  );
}

/**
 * Interactive hierarchical org chart with drill-down.
 *
 * Renders a vertical tree with SVG connectors between levels.
 * Click to expand/collapse subtrees. Status badges on nodes.
 * Fully keyboard navigable with arrow keys.
 */
export function MnOrgChart({
  tree,
  onNodeClick,
  ariaLabel = 'Organization chart',
  className,
}: MnOrgChartProps) {
  const baseId = useId();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['0']));
  const [focusIdx, setFocusIdx] = useState(0);

  const flatNodes = useMemo(() => flattenTree(tree, expanded), [tree, expanded]);

  const toggleExpand = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let nextIdx = focusIdx;
      const current = flatNodes[focusIdx];

      if (e.key === 'ArrowDown') {
        nextIdx = Math.min(focusIdx + 1, flatNodes.length - 1);
      } else if (e.key === 'ArrowUp') {
        nextIdx = Math.max(focusIdx - 1, 0);
      } else if (e.key === 'ArrowRight' && current?.hasChildren) {
        if (!expanded.has(current.path)) {
          toggleExpand(current.path);
          return;
        }
        nextIdx = Math.min(focusIdx + 1, flatNodes.length - 1);
      } else if (e.key === 'ArrowLeft') {
        if (current?.hasChildren && expanded.has(current.path)) {
          toggleExpand(current.path);
          return;
        }
        /* Move to parent */
        const parentPath = current?.path.split('-').slice(0, -1).join('-');
        const parentIdx = flatNodes.findIndex((n) => n.path === parentPath);
        if (parentIdx >= 0) nextIdx = parentIdx;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (current) onNodeClick?.(current.node);
        return;
      } else {
        return;
      }

      e.preventDefault();
      setFocusIdx(nextIdx);
      document.getElementById(`${baseId}-${nextIdx}`)?.focus();
    },
    [focusIdx, flatNodes, expanded, toggleExpand, onNodeClick, baseId],
  );

  return (
    <div
      role="tree"
      aria-label={ariaLabel}
      className={cn('rounded-lg border bg-card p-4', className)}
      onKeyDown={handleKeyDown}
    >
      {flatNodes.map((flat, i) => (
        <div
          key={flat.path}
          className="flex items-center"
          style={{ paddingLeft: `${flat.depth * 28}px` }}
        >
          {/* vertical connector line */}
          {flat.depth > 0 && (
            <div
              className="mr-2 h-full w-px border-l border-border"
              aria-hidden="true"
            />
          )}
          <div className="py-1">
            <NodeCard
              node={flat.node}
              isExpanded={expanded.has(flat.path)}
              hasChildren={flat.hasChildren}
              onToggle={() => toggleExpand(flat.path)}
              onClick={() => {
                setFocusIdx(i);
                onNodeClick?.(flat.node);
              }}
              id={`${baseId}-${i}`}
              focused={i === focusIdx}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
