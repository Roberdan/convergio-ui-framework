'use client';

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export interface StripMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface StripGaugeZone {
  type: 'gauge'; label?: string; value: number; min?: number; max?: number;
}
export interface StripPipelineZone {
  type: 'pipeline'; title?: string;
  rows: { label: string; value: number; secondary?: string }[];
  maxValue?: number;
  footer?: { label: string; value: string };
}
export interface StripTrendZone {
  type: 'trend'; title?: string;
  items: { label: string; value: string | number; data: number[] }[];
}
export interface StripBoardZone {
  type: 'board'; title?: string;
  stats: { label: string; value: string | number }[];
}
export type StripZone = StripGaugeZone | StripPipelineZone | StripTrendZone | StripBoardZone;

export interface MnDashboardStripProps {
  metrics?: StripMetric[];
  zones?: StripZone[];
  ariaLabel?: string;
  className?: string;
}

const TREND_INDICATORS: Record<string, { char: string; cls: string; label: string }> = {
  up: { char: '\u2191', cls: 'text-status-success', label: 'trending up' },
  down: { char: '\u2193', cls: 'text-status-error', label: 'trending down' },
  flat: { char: '\u2192', cls: 'text-muted-foreground', label: 'stable' },
};

const stripVariants = cva(
  'flex flex-wrap items-center gap-4 rounded-lg border bg-card px-4 py-2',
);

function polarXY(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, s: number, e: number) {
  const sp = polarXY(cx, cy, r, s);
  const ep = polarXY(cx, cy, r, e);
  return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`;
}

function SectionTitle({ text }: { text?: string }) {
  if (!text) return null;
  return <span className="text-[0.625rem] font-medium text-muted-foreground">{text}</span>;
}

function GaugeZone({ label, value, min = 0, max = 100 }: StripGaugeZone) {
  const cx = 24, cy = 24, r = 18;
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  return (
    <div className="flex flex-col items-center gap-0.5"
      role="group" aria-label={label ?? `Gauge: ${value}`}>
      <SectionTitle text={label} />
      <svg viewBox="0 0 48 48" className="h-10 w-10"
        role="img" aria-label={`${value} of ${max}`}>
        <path d={arcPath(cx, cy, r, 135, 405)} fill="none"
          stroke="var(--mn-border,var(--border))" strokeWidth={3} strokeLinecap="round" />
        {t > 0 && <path d={arcPath(cx, cy, r, 135, 135 + t * 270)} fill="none"
          stroke="var(--mn-accent,var(--primary))" strokeWidth={3} strokeLinecap="round" />}
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          className="fill-[var(--mn-text,var(--foreground))] text-[0.5rem] font-semibold">{value}</text>
      </svg>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const W = 64, H = 20;
  const lo = Math.min(...data), hi = Math.max(...data), range = hi - lo || 1;
  const d = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - lo) / range) * (H - 2) - 1;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-5 w-16" role="img" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--mn-accent,var(--primary))"
        strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PipelineZone({ title, rows, maxValue, footer }: StripPipelineZone) {
  const peak = maxValue ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="flex min-w-[10rem] flex-col gap-1"
      role="group" aria-label={title ?? 'Pipeline'}>
      <SectionTitle text={title} />
      {rows.map((row, i) => {
        const pct = Math.min((row.value / peak) * 100, 100);
        return (
          <div key={`${row.label}-${i}`} className="flex items-center gap-2 text-xs">
            <span className="w-16 truncate text-muted-foreground">{row.label}</span>
            <span className="w-8 text-right font-medium tabular-nums text-card-foreground">{row.value}</span>
            <div className="h-1.5 flex-1 rounded-full bg-[var(--mn-border,var(--border))]">
              <div className="h-full rounded-full bg-[var(--mn-accent,var(--primary))] transition-[width]"
                style={{ width: `${pct}%` }} />
            </div>
            {row.secondary && (
              <span className="text-[0.625rem] text-muted-foreground">{row.secondary}</span>
            )}
          </div>
        );
      })}
      {footer && (
        <div className="mt-0.5 flex items-center justify-between text-[0.625rem] text-muted-foreground">
          <span>{footer.label}</span><span className="font-medium">{footer.value}</span>
        </div>
      )}
    </div>
  );
}

function TrendZone({ title, items }: StripTrendZone) {
  return (
    <div className="flex flex-col gap-1" role="group" aria-label={title ?? 'Trends'}>
      <SectionTitle text={title} />
      <div className="flex flex-wrap gap-3">
        {items.map((item, i) => (
          <div key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            <div className="flex flex-col">
              <span className="text-[0.625rem] text-muted-foreground">{item.label}</span>
              <span className="text-sm font-semibold tabular-nums text-card-foreground">{item.value}</span>
            </div>
            <Sparkline data={item.data} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardZone({ title, stats }: StripBoardZone) {
  return (
    <div className="flex flex-col gap-1" role="group" aria-label={title ?? 'Board'}>
      <SectionTitle text={title} />
      <div className="grid auto-cols-fr grid-flow-col gap-3">
        {stats.map((s, i) => (
          <div key={`${s.label}-${i}`}
            className="flex flex-col items-center rounded-md bg-[var(--mn-surface-raised,var(--card))] p-2">
            <span className="text-[0.625rem] text-muted-foreground">{s.label}</span>
            <span className="text-sm font-bold tabular-nums text-card-foreground">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ZoneRenderer({ zone }: { zone: StripZone }) {
  switch (zone.type) {
    case 'gauge': return <GaugeZone {...zone} />;
    case 'pipeline': return <PipelineZone {...zone} />;
    case 'trend': return <TrendZone {...zone} />;
    case 'board': return <BoardZone {...zone} />;
  }
}

/** Compact horizontal metric strip with optional zone renderers. */
export function MnDashboardStrip({
  metrics, zones, ariaLabel = 'Dashboard metrics', className,
}: MnDashboardStripProps) {
  const hasContent = (metrics?.length ?? 0) > 0 || (zones?.length ?? 0) > 0;
  if (!hasContent) return null;
  return (
    <div className={cn(stripVariants(), className)} role="list" aria-label={ariaLabel}>
      {metrics?.map((metric, i) => {
        const trend = metric.trend ? TREND_INDICATORS[metric.trend] : null;
        return (
          <div key={`m-${metric.label}-${i}`} role="listitem"
            className="flex items-baseline gap-1.5 text-sm"
            aria-label={`${metric.label}: ${metric.value}${metric.unit ? ` ${metric.unit}` : ''}${trend ? `, ${trend.label}` : ''}`}>
            <span className="text-xs text-muted-foreground">{metric.label}</span>
            <span className="font-semibold tabular-nums text-card-foreground">{metric.value}</span>
            {metric.unit && <span className="text-xs text-muted-foreground">{metric.unit}</span>}
            {trend && (
              <span className={cn('text-sm font-bold', trend.cls)} aria-hidden="true">{trend.char}</span>
            )}
            {i < (metrics.length ?? 0) - 1 && (
              <span className="ml-2 text-border" aria-hidden="true">|</span>
            )}
          </div>
        );
      })}
      {metrics?.length && zones?.length ? (
        <span className="text-border" aria-hidden="true">|</span>
      ) : null}
      {zones?.map((zone, i) => (
        <div key={`z-${zone.type}-${i}`} role="listitem" className="flex items-center">
          <ZoneRenderer zone={zone} />
          {i < zones.length - 1 && (
            <span className="ml-3 text-border" aria-hidden="true">|</span>
          )}
        </div>
      ))}
    </div>
  );
}
