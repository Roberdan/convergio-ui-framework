'use client';

import { cn } from '@/lib/utils';
import { useCallback, useId, useMemo, useState } from 'react';

export interface MeshNode {
  id: string;
  label: string;
  status: 'online' | 'offline' | 'degraded';
  type: 'coordinator' | 'worker' | 'kernel' | 'relay';
}

export interface MeshEdge {
  from: string;
  to: string;
  latency?: number;
}

export interface MnMeshNetworkProps {
  nodes: MeshNode[];
  edges: MeshEdge[];
  /** Called when a node is clicked */
  onNodeSelect?: (node: MeshNode) => void;
  ariaLabel?: string;
  className?: string;
}

const STATUS: Record<string, { color: string; label: string }> = {
  online: { color: 'var(--status-success, hsl(142 71% 45%))', label: 'Online' },
  offline: { color: 'var(--status-error, hsl(0 84% 60%))', label: 'Offline' },
  degraded: { color: 'var(--status-warning, hsl(38 92% 50%))', label: 'Degraded' },
};

const TYPE_RADIUS: Record<string, number> = {
  coordinator: 22, worker: 16, kernel: 18, relay: 14,
};

/** Distribute nodes in a circle layout. */
function circleLayout(count: number, cx: number, cy: number, r: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

/**
 * SVG-based mesh network topology visualization.
 *
 * Nodes are arranged in a circle. Edges connect them with lines.
 * Color indicates status (online/offline/degraded). Click to select,
 * hover for tooltip. Keyboard navigable via Tab + Enter.
 */
export function MnMeshNetwork({
  nodes,
  edges,
  onNodeSelect,
  ariaLabel = 'Mesh network topology',
  className,
}: MnMeshNetworkProps) {
  const uid = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const layoutR = size * 0.35;

  const positions = useMemo(() => {
    const pts = circleLayout(nodes.length, cx, cy, layoutR);
    const map = new Map<string, { x: number; y: number }>();
    nodes.forEach((n, i) => map.set(n.id, pts[i]));
    return map;
  }, [nodes, cx, cy, layoutR]);

  const handleSelect = useCallback(
    (node: MeshNode) => {
      setSelected(node.id);
      onNodeSelect?.(node);
    },
    [onNodeSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, node: MeshNode) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(node);
      }
    },
    [handleSelect],
  );

  const hoveredNode = nodes.find((n) => n.id === hovered);
  const hoveredPos = hovered ? positions.get(hovered) : null;

  if (!nodes.length) {
    return (
      <div className={cn('rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground', className)}>
        No mesh nodes to display.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('rounded-lg border bg-card p-4', className)}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        aria-hidden="true"
      >
        {/* edges + latency labels */}
        {edges.map((edge) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) return null;
          const active = selected === edge.from || selected === edge.to;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={active ? 'var(--primary)' : 'var(--border)'}
                strokeWidth={active ? 2.5 : 1.5}
                strokeDasharray={edge.latency && edge.latency > 100 ? '6 3' : undefined}
                className="transition-all duration-200"
              />
              {edge.latency != null && (
                <text
                  x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                  textAnchor="middle" fill="var(--muted-foreground)" fontSize="10"
                >
                  {edge.latency}ms
                </text>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const r = TYPE_RADIUS[node.type] ?? 16;
          const isSelected = selected === node.id;
          return (
            <g
              key={node.id}
              tabIndex={0}
              role="button"
              aria-label={`${node.label}, ${STATUS[node.status].label}, ${node.type}`}
              onClick={() => handleSelect(node)}
              onKeyDown={(e) => handleKeyDown(e, node)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.id)}
              onBlur={() => setHovered(null)}
              className="cursor-pointer outline-none"
            >
              {/* selection ring */}
              {isSelected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r + 5}
                  fill="none"
                  stroke="var(--ring)"
                  strokeWidth="2"
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={STATUS[node.status].color}
                opacity={node.status === 'offline' ? 0.4 : 0.85}
                className="transition-opacity duration-200"
              />
              <text
                x={pos.x}
                y={pos.y + r + 14}
                textAnchor="middle"
                fill="var(--card-foreground)"
                fontSize="11"
                fontWeight="500"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* tooltip */}
        {hoveredNode && hoveredPos && (
          <g>
            <rect
              x={hoveredPos.x - 60}
              y={hoveredPos.y - 50}
              width="120"
              height="32"
              rx="6"
              fill="var(--popover, var(--card))"
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={hoveredPos.x}
              y={hoveredPos.y - 38}
              textAnchor="middle"
              fill="var(--popover-foreground, var(--card-foreground))"
              fontSize="10"
            >
              {hoveredNode.type} | {STATUS[hoveredNode.status].label}
            </text>
          </g>
        )}
      </svg>

      {/* screen reader list */}
      <ul className="sr-only" aria-label="Mesh nodes">
        {nodes.map((n) => (
          <li key={n.id}>
            {n.label}: {STATUS[n.status].label} ({n.type})
          </li>
        ))}
      </ul>

      {/* legend */}
      <div
        className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground"
        aria-label="Status legend"
      >
        {Object.entries(STATUS).map(([key, s]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
