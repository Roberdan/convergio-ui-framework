'use client';

import {
  MnHeatmap, MnBudgetTreemap, MnWaterfall,
  MnDecisionMatrix, MnPipelineRanking, MnActivityFeed,
} from '@/components/maranello';
import {
  heatmapData, treemapItems, waterfallSteps,
  decisionCriteria, decisionOptions, pipelineStages, activityItems,
} from './components-data-phase2';

function Card({ name, desc, children, wide }: { name: string; desc: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 space-y-3 ${wide ? 'md:col-span-2' : ''}`}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SectionDataviz() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-heatmap" desc="2D grid heatmap with color interpolation">
        <MnHeatmap data={heatmapData} showValues ariaLabel="Agent activity heatmap" />
      </Card>

      <Card name="mn-budget-treemap" desc="Proportional area treemap for budget visualization">
        <div className="h-48">
          <MnBudgetTreemap items={treemapItems} ariaLabel="Q2 2026 budget allocation" />
        </div>
      </Card>

      <Card name="mn-waterfall" desc="Waterfall chart showing incremental value changes">
        <div className="h-64">
          <MnWaterfall steps={waterfallSteps} ariaLabel="Revenue waterfall Q1-Q2 2026" />
        </div>
      </Card>

      <Card name="mn-decision-matrix" desc="Weighted scoring matrix for option comparison">
        <MnDecisionMatrix
          criteria={decisionCriteria}
          options={decisionOptions}
          ariaLabel="Technology stack decision"
        />
      </Card>

      <Card name="mn-pipeline-ranking" desc="Funnel pipeline with conversion rates">
        <MnPipelineRanking stages={pipelineStages} ariaLabel="Customer acquisition pipeline" />
      </Card>

      <Card name="mn-activity-feed" desc="Real-time activity stream with priority badges">
        <MnActivityFeed items={activityItems} ariaLabel="Platform activity feed" />
      </Card>
    </div>
  );
}
