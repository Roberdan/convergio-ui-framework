'use client';

import { cn } from '@/lib/utils';
import { useCallback, useId, useMemo, useState } from 'react';

export interface BrainNode {
  id: string;
  label: string;
  type: 'core' | 'memory' | 'skill' | 'sense';
  active?: boolean;
}

export interface BrainConnection {
  from: string;
  to: string;
  strength: number;
}

export interface MnAugmentedBrainProps {
  nodes: BrainNode[];
  connections: BrainConnection[];
  /** Called when a node is clicked */
  onNodeClick?: (node: BrainNode) => void;
  ariaLabel?: string;
  className?: string;
}

const NODE_COLORS: Record<BrainNode['type'], string> = {
  core: 'var(--primary)',
  memory: 'var(--chart-2, hsl(160 60% 45%))',
  skill: 'var(--chart-3, hsl(30 80% 55%))',
  sense: 'var(--chart-4, hsl(280 65% 60%))',
};

const LAYER_ORDER: BrainNode['type'][] = ['core', 'memory', 'skill', 'sense'];

interface NodePos {
  node: BrainNode;
  x: number;
  y: number;
}

/** Compute radial positions: core at center, layers radiating outward. */
function computeLayout(nodes: BrainNode[], size: number): NodePos[] {
  const cx = size / 2;
  const cy = size / 2;
  const positions: NodePos[] = [];
  for (const layer of LAYER_ORDER) {
    const layerNodes = nodes.filter((n) => n.type === layer);
    if (!layerNodes.length) continue;
    if (layer === 'core') {
      const spacing = layerNodes.length > 1 ? (2 * Math.PI) / layerNodes.length : 0;
      const r = layerNodes.length > 1 ? size * 0.08 : 0;
      for (let i = 0; i < layerNodes.length; i++) {
        const a = spacing * i - Math.PI / 2;
        positions.push({ node: layerNodes[i], x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
    } else {
      const layerIdx = LAYER_ORDER.indexOf(layer);
      const radius = size * (0.18 + layerIdx * 0.12);
      const angleStep = (2 * Math.PI) / layerNodes.length;
      const offset = layerIdx * 0.4;
      for (let i = 0; i < layerNodes.length; i++) {
        const angle = angleStep * i - Math.PI / 2 + offset;
        positions.push({ node: layerNodes[i], x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
      }
    }
  }
  return positions;
}

/** AI brain visualization with radial layout and animated active nodes. */
export function MnAugmentedBrain({
  nodes,
  connections,
  onNodeClick,
  ariaLabel = 'AI brain visualization',
  className,
}: MnAugmentedBrainProps) {
  const id = useId();
  const SIZE = 400;
  const [selected, setSelected] = useState<string | null>(null);

  const positions = useMemo(() => computeLayout(nodes, SIZE), [nodes]);

  const posMap = useMemo(() => {
    const m = new Map<string, NodePos>();
    for (const p of positions) m.set(p.node.id, p);
    return m;
  }, [positions]);

  const handleClick = useCallback(
    (node: BrainNode) => {
      setSelected((prev) => (prev === node.id ? null : node.id));
      onNodeClick?.(node);
    },
    [onNodeClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, node: BrainNode) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(node);
      }
    },
    [handleClick],
  );

  const selectedNode = nodes.find((n) => n.id === selected);

  return (
    <div className={cn('relative', className)} aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <style>{`
            @keyframes mn-pulse {
              0%, 100% { r: 14; opacity: 1; }
              50% { r: 18; opacity: 0.7; }
            }
          `}</style>
        </defs>

        {/* connections */}
        {connections.map((conn) => {
          const from = posMap.get(conn.from);
          const to = posMap.get(conn.to);
          if (!from || !to) return null;
          const opacity = 0.15 + conn.strength * 0.6;
          return (
            <line
              key={`${conn.from}-${conn.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--muted-foreground)"
              strokeWidth={1 + conn.strength * 2}
              opacity={opacity}
            />
          );
        })}

        {/* nodes */}
        {positions.map((pos) => {
          const isActive = pos.node.active;
          const isSel = pos.node.id === selected;
          const color = NODE_COLORS[pos.node.type];
          const r = pos.node.type === 'core' ? 18 : 14;
          return (
            <g
              key={pos.node.id}
              tabIndex={0}
              role="button"
              aria-label={`${pos.node.label} (${pos.node.type}${isActive ? ', active' : ''})`}
              onClick={() => handleClick(pos.node)}
              onKeyDown={(e) => handleKeyDown(e, pos.node)}
              className="cursor-pointer focus-visible:outline-none"
            >
              {/* focus ring */}
              {isSel && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r + 5}
                  fill="none"
                  stroke="var(--ring)"
                  strokeWidth={2}
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={color}
                opacity={isActive ? 1 : 0.5}
                style={isActive ? { animation: 'mn-pulse 2s ease-in-out infinite' } : undefined}
              />
              <text
                x={pos.x}
                y={pos.y + r + 14}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize={10}
                className="pointer-events-none select-none"
              >
                {pos.node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div
        className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground"
        aria-label="Node type legend"
      >
        {LAYER_ORDER.map((type) => (
          <span key={type} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: NODE_COLORS[type] }}
            />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>

      {/* detail panel */}
      {selectedNode && (
        <div
          className="mt-2 rounded-md border bg-card p-3 text-sm"
          role="region"
          aria-label={`Details for ${selectedNode.label}`}
          aria-live="polite"
        >
          <p className="font-medium text-card-foreground">{selectedNode.label}</p>
          <p className="text-xs text-muted-foreground">
            Type: {selectedNode.type} | Status: {selectedNode.active ? 'Active' : 'Inactive'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Connections: {connections.filter(
              (c) => c.from === selectedNode.id || c.to === selectedNode.id,
            ).length}
          </p>
        </div>
      )}
    </div>
  );
}
