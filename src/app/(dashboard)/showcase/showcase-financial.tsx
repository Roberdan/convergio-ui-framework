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
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import { COMPONENT_PROPS } from './component-props';
import {
  finOpsMetrics,
  agentCostRows,
  costTimelineLabels,
  costTimelineSeries,
  kpiRows,
  cohortRows,
  tokenUsage,
} from './showcase-financial-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

/** Section: Financial, Cost & Metrics components. */
export function ShowcaseFinancial() {
  return (
    <section aria-labelledby="section-financial">
      <h2 id="section-financial" className="text-lg font-semibold mb-4">
        Financial & Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-finops')} example={`<MnFinOps metrics={metrics} />`}>
            <MnFinOps metrics={finOpsMetrics} ariaLabel="Platform financial operations" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-agent-cost-breakdown')}
            example={`<MnAgentCostBreakdown rows={rows} currency="USD" period="April 2026" />`}
          >
            <MnAgentCostBreakdown rows={agentCostRows} currency="USD" period="April 2026" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-cost-timeline')}
            example={`<MnCostTimeline labels={labels} series={series} unit="$" />`}
          >
            <MnCostTimeline labels={costTimelineLabels} series={costTimelineSeries} unit="$" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-kpi-scorecard')}
            props={COMPONENT_PROPS['mn-kpi-scorecard']}
            example={`<MnKpiScorecard rows={rows} currency="$" />`}
          >
            <MnKpiScorecard rows={kpiRows} currency="$" ariaLabel="Platform KPIs" />
          </ComponentDoc>
        </div>

        <ComponentDoc
          entry={entry('mn-bullet-chart')}
          example={`<MnBulletChart value={487} target={500} max={600} label="Throughput" />`}
        >
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
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-confidence-chart')}
          example={`<MnConfidenceChart labels={l} values={v} lower={lo} upper={hi} />`}
        >
          <MnConfidenceChart
            labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            values={[92, 94, 91, 95, 93, 96]}
            lower={[88, 90, 87, 91, 89, 92]}
            upper={[96, 98, 95, 99, 97, 100]}
            unit="%"
            height={160}
          />
        </ComponentDoc>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-cohort-grid')}
            example={`<MnCohortGrid rows={rows} periodLabels={labels} />`}
          >
            <MnCohortGrid
              rows={cohortRows}
              periodLabels={['M0', 'M1', 'M2', 'M3', 'M4', 'M5']}
            />
          </ComponentDoc>
        </div>

        <ComponentDoc
          entry={entry('mn-token-meter')}
          example={`<MnTokenMeter usage={usage} label="Session Token Usage" showCost />`}
        >
          <MnTokenMeter usage={tokenUsage} label="Session Token Usage" showCost />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-half-gauge')}
          example={`<MnHalfGauge value={73} max={100} label="Efficiency" unit="%" />`}
        >
          <MnHalfGauge value={73} min={0} max={100} label="Agent Efficiency" unit="%" />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-flip-counter')}
          example={`<MnFlipCounter value={1847} digits={5} size="md" label="Tasks" />`}
        >
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
        </ComponentDoc>
      </div>
    </section>
  );
}
