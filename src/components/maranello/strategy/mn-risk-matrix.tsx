'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useCallback, useId, useMemo, useState } from 'react';

export interface RiskItem {
  id: string;
  label: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  color?: string;
}

type Severity = 'low' | 'medium' | 'high' | 'critical';

function severity(score: number): Severity {
  if (score <= 4) return 'low';
  if (score <= 9) return 'medium';
  if (score <= 16) return 'high';
  return 'critical';
}

function severityLabel(s: Severity): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const FILL: Record<Severity, string> = {
  low: 'var(--status-success, var(--mn-success, #22c55e))',
  medium: 'var(--status-warning, var(--mn-warning, #eab308))',
  high: 'var(--status-error, var(--mn-error, #ef4444))',
  critical: 'var(--status-error, var(--mn-error, #ef4444))',
};

const FILL_OPACITY: Record<Severity, number> = {
  low: 0.15,
  medium: 0.2,
  high: 0.25,
  critical: 0.38,
};

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '\u2026' : s;
}

const G = 5;
const CELL = 56;
const R = 10;
const ML = 40;
const MT = 8;
const MB = 36;
const MR = 8;
const GW = G * CELL;
const GH = G * CELL;
const W = ML + GW + MR;
const H = MT + GH + MB;
const OFFSETS: [number, number][] = [[0, 0], [-12, -12], [12, -12], [-12, 12]];

const riskMatrixVariants = cva('inline-block', {
  variants: {
    size: {
      sm: 'max-w-xs',
      default: 'max-w-md',
      lg: 'max-w-xl',
    },
  },
  defaultVariants: { size: 'default' },
});

export interface MnRiskMatrixProps
  extends VariantProps<typeof riskMatrixVariants> {
  items: RiskItem[];
  animate?: boolean;
  onItemHover?: (item: RiskItem | null) => void;
  onItemClick?: (item: RiskItem) => void;
  ariaLabel?: string;
  className?: string;
}

export function MnRiskMatrix({
  items,
  animate = true,
  onItemHover,
  onItemClick,
  ariaLabel = 'Risk matrix',
  size,
  className,
}: MnRiskMatrixProps) {
  const uid = useId();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const cellGroups = useMemo(() => {
    const map = new Map<string, RiskItem[]>();
    for (const it of items) {
      const k = `${it.impact},${it.probability}`;
      map.set(k, [...(map.get(k) ?? []), it]);
    }
    return map;
  }, [items]);

  const hovered = useMemo(
    () => items.find((it) => it.id === hoveredId) ?? null,
    [items, hoveredId],
  );

  const center = useCallback(
    (col: number, row: number): [number, number] => [
      ML + (col - 0.5) * CELL,
      MT + GH - (row - 0.5) * CELL,
    ],
    [],
  );

  const hover = useCallback(
    (it: RiskItem | null) => {
      setHoveredId(it?.id ?? null);
      onItemHover?.(it);
    },
    [onItemHover],
  );

  return (
    <div className={cn(riskMatrixVariants({ size }), className)}>
      <div className="sr-only" role="status">
        {ariaLabel}: {items.length} items.
        {items.map((it) => {
          const s = it.probability * it.impact;
          return (
            <span key={it.id}>
              {it.label}: P{it.probability} I{it.impact} = {s} (
              {severityLabel(severity(s))}){'. '}
            </span>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="w-full h-auto">
        {/* Severity grid */}
        {Array.from({ length: G }, (_, ri) =>
          Array.from({ length: G }, (_, ci) => {
            const row = G - ri;
            const col = ci + 1;
            const lv = severity(row * col);
            return (
              <rect
                key={`${ri}-${ci}`}
                x={ML + ci * CELL}
                y={MT + ri * CELL}
                width={CELL}
                height={CELL}
                fill={FILL[lv]}
                opacity={FILL_OPACITY[lv]}
                stroke="var(--border)"
                strokeWidth={0.5}
              />
            );
          }),
        )}

        <rect x={ML} y={MT} width={GW} height={GH} fill="none" stroke="var(--border)" strokeWidth={1} />

        {/* Axis tick labels */}
        {Array.from({ length: G }, (_, i) => (
          <text key={`xt-${i}`} x={ML + (i + 0.5) * CELL} y={MT + GH + 14} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
            {i + 1}
          </text>
        ))}
        {Array.from({ length: G }, (_, i) => (
          <text key={`yt-${i}`} x={ML - 8} y={MT + GH - (i + 0.5) * CELL} textAnchor="end" dominantBaseline="central" fontSize={10} fill="var(--muted-foreground)">
            {i + 1}
          </text>
        ))}

        {/* Axis titles */}
        <text x={ML + GW / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="var(--foreground)">Impact</text>
        <text x={12} y={MT + GH / 2} textAnchor="middle" fontSize={11} fill="var(--foreground)" transform={`rotate(-90,12,${MT + GH / 2})`}>Probability</text>

        {/* Corner labels */}
        <text x={ML + 4} y={MT + GH - 4} fontSize={9} fill="var(--muted-foreground)" opacity={0.6}>Low</text>
        <text x={ML + GW - 4} y={MT + 12} textAnchor="end" fontSize={9} fill="var(--muted-foreground)" opacity={0.6}>Critical</text>

        {/* Item circles */}
        {Array.from(cellGroups.entries()).flatMap(([, group]) =>
          group.slice(0, 4).map((it, idx) => {
            const [cx, cy] = center(it.impact, it.probability);
            const [ox, oy] = OFFSETS[idx];
            const px = cx + ox;
            const py = cy + oy;
            const isHovered = hoveredId === it.id;
            return (
              <g
                key={it.id}
                className={cn('cursor-pointer', animate && 'animate-in fade-in zoom-in-50 duration-400')}
                style={animate ? { animationDelay: `${idx * 60}ms`, animationFillMode: 'both' } : undefined}
                onMouseEnter={() => hover(it)}
                onMouseLeave={() => hover(null)}
                onFocus={() => hover(it)}
                onBlur={() => hover(null)}
                onClick={() => onItemClick?.(it)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemClick?.(it); } }}
                role="button"
                tabIndex={0}
                aria-label={`${it.label}: Probability ${it.probability}, Impact ${it.impact}, ${severityLabel(severity(it.probability * it.impact))}`}
              >
                <circle cx={px} cy={py} r={R} fill={it.color ?? 'var(--primary)'} stroke={isHovered ? 'var(--ring)' : 'none'} strokeWidth={isHovered ? 2 : 0} />
                <text x={px} y={py + R + 10} textAnchor="middle" fontSize={8} fill="var(--foreground)">{truncate(it.label, 10)}</text>
              </g>
            );
          }),
        )}

        {/* Hover tooltip */}
        {hovered && (() => {
          const [cx, cy] = center(hovered.impact, hovered.probability);
          const sc = hovered.probability * hovered.impact;
          const tip = `${hovered.label} (P${hovered.probability}\u00D7I${hovered.impact}=${sc})`;
          const tw = tip.length * 6 + 16;
          const th = 22;
          let tx = cx - tw / 2;
          let ty = cy - R - th - 6;
          if (tx < 2) tx = 2;
          if (tx + tw > W - 2) tx = W - tw - 2;
          if (ty < 2) ty = cy + R + 6;
          return (
            <g aria-hidden="true" id={`${uid}-tip`}>
              <rect x={tx} y={ty} width={tw} height={th} rx={4} fill="var(--popover, var(--card))" stroke="var(--border)" strokeWidth={1} />
              <text x={tx + 8} y={ty + th / 2} dominantBaseline="central" fontSize={10} fill="var(--popover-foreground, var(--card-foreground))">{tip}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
