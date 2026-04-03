'use client';

import {
  MnFinOps,
  MnAgentCostBreakdown,
  MnCostTimeline,
  MnBulletChart,
  MnCohortGrid,
  MnConfidenceChart,
  MnTokenMeter,
  MnFlipCounter,
  MnHalfGauge,
  MnKpiScorecard,
} from '@/components/maranello';
import {
  finOpsMetrics,
  agentCostRows,
  costTimelineLabels,
  costTimelineSeries,
  kpiRows,
  cohortRows,
  tokenUsage,
} from './showcase-financial-data';

/** Section: Financial, Cost & Metrics components. */
export function ShowcaseFinancial() {
  return (
    <section aria-labelledby="section-financial">
      <h2 id="section-financial" className="text-lg font-semibold mb-4">
        Financial & Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FinOps */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnFinOps</h3>
          <MnFinOps metrics={finOpsMetrics} ariaLabel="Platform financial operations" />
        </div>

        {/* Agent Cost Breakdown */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnAgentCostBreakdown</h3>
          <MnAgentCostBreakdown rows={agentCostRows} currency="USD" period="April 2026" />
        </div>

        {/* Cost Timeline */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnCostTimeline</h3>
          <MnCostTimeline labels={costTimelineLabels} series={costTimelineSeries} unit="$" />
        </div>

        {/* KPI Scorecard */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnKpiScorecard</h3>
          <MnKpiScorecard rows={kpiRows} currency="$" ariaLabel="Platform KPIs" />
        </div>

        {/* Bullet Chart */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnBulletChart</h3>
          <MnBulletChart
            value={487}
            target={500}
            max={600}
            label="Task Throughput"
            unit="tasks/day"
            ranges={[
              { min: 0, max: 300, label: 'Low' },
              { min: 300, max: 450, label: 'Medium' },
              { min: 450, max: 600, label: 'High' },
            ]}
          />
        </div>

        {/* Confidence Chart */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnConfidenceChart</h3>
          <MnConfidenceChart
            labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            values={[92, 94, 91, 95, 93, 96]}
            lower={[88, 90, 87, 91, 89, 92]}
            upper={[96, 98, 95, 99, 97, 100]}
            unit="%"
            height={160}
          />
        </div>

        {/* Cohort Grid */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnCohortGrid</h3>
          <MnCohortGrid
            rows={cohortRows}
            periodLabels={['M0', 'M1', 'M2', 'M3', 'M4', 'M5']}
          />
        </div>

        {/* Token Meter */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnTokenMeter</h3>
          <MnTokenMeter usage={tokenUsage} label="Session Token Usage" showCost />
        </div>

        {/* Half Gauge */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnHalfGauge</h3>
          <MnHalfGauge value={73} min={0} max={100} label="Agent Efficiency" unit="%" />
        </div>

        {/* Flip Counter */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnFlipCounter</h3>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
              <MnFlipCounter value={1847} digits={5} size="md" label="Tasks completed" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Revenue ($)</p>
              <MnFlipCounter value={98520} digits={6} prefix="$" size="sm" label="Revenue" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
