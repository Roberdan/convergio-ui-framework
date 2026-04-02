'use client';

import {
  MnHeatmap,
  MnBudgetTreemap,
  MnWaterfall,
  MnDecisionMatrix,
  MnPipelineRanking,
  MnActivityFeed,
} from '@/components/maranello';
import {
  heatmapData,
  treemapItems,
  waterfallSteps,
  decisionCriteria,
  decisionOptions,
  pipelineStages,
  activityItems,
} from './showcase-data';

/** Section: W0 + W2 Data Visualization components. */
export function ShowcaseDataViz() {
  return (
    <section aria-labelledby="section-dataviz">
      <h2 id="section-dataviz" className="text-lg font-semibold mb-4">
        W0 + W2 — Data Visualization
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnHeatmap</h3>
          <MnHeatmap data={heatmapData} showValues ariaLabel="Weekly agent activity heatmap" />
        </div>

        {/* Budget Treemap */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnBudgetTreemap</h3>
          <MnBudgetTreemap items={treemapItems} ariaLabel="Department budget allocation" />
        </div>

        {/* Waterfall */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnWaterfall</h3>
          <MnWaterfall steps={waterfallSteps} ariaLabel="Quarterly financial waterfall" />
        </div>

        {/* Pipeline Ranking */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnPipelineRanking</h3>
          <MnPipelineRanking stages={pipelineStages} ariaLabel="Client acquisition funnel" />
        </div>

        {/* Decision Matrix */}
        <div className="rounded-lg border p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnDecisionMatrix</h3>
          <MnDecisionMatrix
            criteria={decisionCriteria}
            options={decisionOptions}
            ariaLabel="LLM provider evaluation"
          />
        </div>

        {/* Activity Feed */}
        <div className="rounded-lg border p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnActivityFeed</h3>
          <MnActivityFeed items={activityItems} refreshInterval={0} ariaLabel="Platform activity log" />
        </div>
      </div>
    </section>
  );
}
