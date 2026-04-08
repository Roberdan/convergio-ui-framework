'use client';

import {
  MnGauge,
  MnDashboardStrip,
  MnHeatmap,
  MnSystemStatus,
} from '@/components/maranello';
import {
  PERF_DIALS,
  utilizationGauge,
  qualityScoreGauge,
  portfolioMapGauge,
  SECONDARY_GAUGES,
  stripMetricsTop,
  STRIP_ZONES,
  HEATMAP_ROWS,
  COCKPIT_SERVICES,
  COCKPIT_INCIDENTS,
} from './showcase-cockpit-data';

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="mb-4 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{number}</p>
      <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SignalPanel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col items-center justify-end gap-1 self-end pb-2">
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</span>
      <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary">{title}</span>
      <div className="mt-1 h-px w-12 bg-primary/30" />
    </div>
  );
}

export function ShowcaseCockpit() {
  return (
    <div className="space-y-8">
      {/* Performance Dials */}
      <section>
        <SectionHeading number="01" title="Performance Dials" description="Live-style telemetry dials with animated needle, tick marks, and Ferrari Luce cap." />
        <div className="flex flex-wrap items-end justify-between gap-6">
          {PERF_DIALS.map((d) => (
            <div key={d.label} className="rounded-xl border bg-card p-4 text-center shadow-sm" style={{ minWidth: d.size === 'lg' ? 320 : d.size === 'sm' ? 140 : 220, flex: 1 }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{d.label}</p>
              <MnGauge value={d.value} max={d.max} unit={d.unit} size={d.size} color={d.color} startAngle={-225} endAngle={45} numbers={[0, 25, 50, 75, 100]} />
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Strip */}
      <section>
        <SectionHeading number="02" title="Dashboard Strip" description="The main instrument nacelle: broad strip with gauge, pipeline bars, trend sparklines, and secondary board." />
        <MnDashboardStrip ariaLabel="Cockpit dashboard strip" metrics={stripMetricsTop} zones={STRIP_ZONES} className="rounded-xl border shadow-sm" />
      </section>

      {/* KPI Instrument Cluster (Binnacle) */}
      <section>
        <SectionHeading number="03" title="KPI Instrument Cluster" description="Ferrari-like binnacle with complications: inner ring, odometer, arcBar, sub-dials, crosshair scatter, and status LEDs." />
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Maranello Luce / Instrument Binnacle</span>
            <span className="rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold text-primary">◈ Aligned</span>
          </div>
          <div className="flex flex-wrap items-end justify-center gap-4">
            <SignalPanel eyebrow="LEFT SIGNAL" title="QUALITY / CLOSED LOOP" />
            <div className="text-center">
              <MnGauge {...utilizationGauge} size="sm" />
              <p className="mt-1 text-xs font-semibold text-muted-foreground">Utilization</p>
            </div>
            <div className="text-center">
              <MnGauge {...qualityScoreGauge} size="lg" />
              <p className="mt-1 text-xs font-semibold text-muted-foreground">Quality Score</p>
            </div>
            <div className="text-center">
              <MnGauge {...portfolioMapGauge} size="sm" />
              <p className="mt-1 text-xs font-semibold text-muted-foreground">Portfolio Map</p>
            </div>
            <SignalPanel eyebrow="RIGHT SIGNAL" title="DRIFT / TUNED RESPONSE" />
          </div>
        </div>
      </section>

      {/* Secondary Gauges */}
      <section>
        <SectionHeading number="04" title="Secondary Gauges" description="Compact gauge cluster with risk, data quality, KPI coverage, and multi-graph sparkline trend." />
        <div className="flex flex-wrap items-start justify-center gap-6">
          {SECONDARY_GAUGES.map((g) => (
            <div key={g.title} className="rounded-xl border bg-card p-3 text-center shadow-sm" style={{ width: 180 }}>
              <MnGauge
                value={g.value} max={g.max} color={g.color} label={g.label}
                ticks={g.ticks} subticks={g.subticks}
                startAngle={g.startAngle} endAngle={g.endAngle}
                numbers={'numbers' in g ? [...g.numbers] : undefined}
                centerValue={g.centerValue} centerUnit={g.centerUnit}
                statusLed={'statusLed' in g ? g.statusLed : undefined}
                trend={'trend' in g ? g.trend : undefined}
                innerRing={'innerRing' in g ? g.innerRing : undefined}
                arcBar={'arcBar' in g ? g.arcBar : undefined}
                multigraph={'multigraph' in g ? g.multigraph : undefined}
                size="sm"
              />
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{g.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Resource Heatmap */}
      <section>
        <SectionHeading number="05" title="Resource Heatmap" description="Weekly utilization heatmap with oklch color interpolation and keyboard navigation." />
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <MnHeatmap data={HEATMAP_ROWS} showValues ariaLabel="Weekly resource utilization heatmap" className="w-full" />
        </div>
      </section>

      {/* System Status */}
      <section>
        <SectionHeading number="06" title="System Status" description="Service health monitor with uptime, latency, and incident history." />
        <MnSystemStatus
          services={COCKPIT_SERVICES}
          incidents={COCKPIT_INCIDENTS}
          version="v3.0.0"
          environment="Production"
        />
      </section>
    </div>
  );
}
