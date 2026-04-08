'use client';

import {
  MnHeatmap,
  MnBudgetTreemap,
  MnWaterfall,
  MnDecisionMatrix,
  MnPipelineRanking,
  MnActivityFeed,
  MnChart,
  MnFunnel,
  MnGauge,
  MnHbar,
  MnSpeedometer,
} from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import { COMPONENT_PROPS } from './component-props';
import {
  heatmapData,
  treemapItems,
  waterfallSteps,
  decisionCriteria,
  decisionOptions,
  pipelineStages,
  activityItems,
} from './showcase-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

/** Section: W0 + W2 Data Visualization components. */
export function ShowcaseDataViz() {
  return (
    <section aria-labelledby="section-dataviz">
      <h2 id="section-dataviz" className="text-lg font-semibold mb-4">
        W0 + W2 — Data Visualization
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-chart')}
            props={COMPONENT_PROPS['mn-chart']}
            example={`<MnChart type="area" labels={labels} series={series} showLegend />`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MnChart
                type="area"
                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
                series={[
                  { label: 'Requests', data: [1200, 1900, 1500, 2100, 2400, 2800] },
                  { label: 'Completions', data: [1100, 1700, 1400, 1950, 2300, 2650] },
                ]}
                showLegend
              />
              <MnChart
                type="donut"
                segments={[
                  { label: 'GPT-4o', value: 42 },
                  { label: 'Claude 3.5', value: 31 },
                  { label: 'Gemini Pro', value: 18 },
                  { label: 'Local LLM', value: 9 },
                ]}
                showLegend
              />
            </div>
          </ComponentDoc>
        </div>

        <ComponentDoc
          entry={entry('mn-funnel')}
          example={`<MnFunnel data={{ pipeline: stages }} />`}
        >
          <MnFunnel
            data={{
              pipeline: [
                { label: 'Leads', count: 2400, color: '#4EA8DE' },
                { label: 'Qualified', count: 1680, color: '#48BFE3' },
                { label: 'Proposal', count: 840, color: '#56CFE1' },
                { label: 'Negotiation', count: 420, color: '#64DFDF' },
                { label: 'Closed Won', count: 252, color: '#72EFDD' },
              ],
            }}
          />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-hbar')}
          example={`<MnHbar title="Latency" unit="ms" maxValue={500} bars={bars} />`}
        >
          <MnHbar
            title="Model latency (p95)"
            unit="ms"
            maxValue={500}
            bars={[
              { label: 'GPT-4o', value: 320, color: '#4EA8DE' },
              { label: 'Claude 3.5', value: 280, color: '#48BFE3' },
              { label: 'Gemini', value: 410, color: '#56CFE1' },
              { label: 'Llama 3', value: 180, color: '#64DFDF' },
              { label: 'Mistral', value: 150, color: '#72EFDD' },
            ]}
          />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-gauge')}
          example={`<MnGauge value={72} min={0} max={100} label="Confidence" size="md" />`}
        >
          <div className="flex justify-center">
            <MnGauge value={72} min={0} max={100} label="Confidence" size="md" />
          </div>
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-speedometer')}
          props={COMPONENT_PROPS['mn-speedometer']}
          example={`<MnSpeedometer value={187} max={300} unit="req/s" />`}
        >
          <div className="flex justify-center">
            <MnSpeedometer value={187} min={0} max={300} unit="req/s" size="md" />
          </div>
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-heatmap')}
          example={`<MnHeatmap data={data} showValues />`}
        >
          <MnHeatmap data={heatmapData} showValues ariaLabel="Weekly agent activity heatmap" />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-budget-treemap')}
          example={`<MnBudgetTreemap items={items} />`}
        >
          <MnBudgetTreemap items={treemapItems} ariaLabel="Department budget allocation" />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-waterfall')}
          example={`<MnWaterfall steps={steps} />`}
        >
          <MnWaterfall steps={waterfallSteps} ariaLabel="Quarterly financial waterfall" />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-pipeline-ranking')}
          example={`<MnPipelineRanking stages={stages} />`}
        >
          <MnPipelineRanking stages={pipelineStages} ariaLabel="Client acquisition funnel" />
        </ComponentDoc>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-decision-matrix')}
            example={`<MnDecisionMatrix criteria={criteria} options={options} />`}
          >
            <MnDecisionMatrix criteria={decisionCriteria} options={decisionOptions} ariaLabel="LLM provider evaluation" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-activity-feed')}
            props={COMPONENT_PROPS['mn-activity-feed']}
            example={`<MnActivityFeed items={items} refreshInterval={30000} />`}
          >
            <MnActivityFeed items={activityItems} refreshInterval={0} ariaLabel="Platform activity log" />
          </ComponentDoc>
        </div>
      </div>
    </section>
  );
}
