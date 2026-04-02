'use client';

import {
  MnStrategyCanvas, MnSwot, MnPorterFiveForces,
  MnFinOps, MnCustomerJourneyMap,
  MnCustomerJourney, MnDashboard,
} from '@/components/maranello';
import {
  strategySegments, swotData, porterForces,
  finopsMetrics, journeyStages,
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

export function SectionStrategy() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-strategy-canvas" desc="Business Model Canvas with editable segments" wide>
        <MnStrategyCanvas segments={strategySegments} ariaLabel="Convergio Business Model Canvas" />
      </Card>

      <Card name="mn-swot" desc="SWOT Analysis 2x2 quadrant grid">
        <MnSwot
          strengths={swotData.strengths}
          weaknesses={swotData.weaknesses}
          opportunities={swotData.opportunities}
          threats={swotData.threats}
          ariaLabel="Convergio SWOT analysis"
        />
      </Card>

      <Card name="mn-porter-five-forces" desc="Porter's Five Forces competitive analysis">
        <MnPorterFiveForces forces={porterForces} ariaLabel="Competitive landscape analysis" />
      </Card>

      <Card name="mn-finops" desc="FinOps cost tracking with budget utilization">
        <MnFinOps
          metrics={finopsMetrics}
          formatValue={(v) => `$${v.toLocaleString()}`}
          ariaLabel="Q2 2026 cloud spend"
        />
      </Card>

      <Card name="mn-customer-journey-map" desc="Customer journey with touchpoints and sentiment">
        <MnCustomerJourneyMap stages={journeyStages} ariaLabel="Convergio customer journey" />
      </Card>

      <Card name="mn-customer-journey" desc="Engagement-based journey swimlane" wide>
        <MnCustomerJourney
          phases={[
            { id: 'discovery', label: 'Discovery', engagements: [
              { id: 'e1', title: 'GitHub Repository Visit', status: 'completed', type: 'opportunity', assignee: 'Sara' },
              { id: 'e2', title: 'Technical Blog Review', status: 'completed', type: 'task', assignee: 'Marco' },
            ]},
            { id: 'evaluation', label: 'Evaluation', engagements: [
              { id: 'e3', title: 'Platform Trial Setup', status: 'active', type: 'task', assignee: 'Rex' },
              { id: 'e4', title: 'Architecture Review Meeting', status: 'pending', type: 'meeting', date: '2026-04-05' },
            ]},
            { id: 'adoption', label: 'Adoption', engagements: [
              { id: 'e5', title: 'Enterprise License Agreement', status: 'pending', type: 'contract' },
            ]},
          ]}
        />
      </Card>

      <Card name="mn-dashboard" desc="Configurable dashboard grid with widget renderers" wide>
        <MnDashboard
          schema={{
            rows: [
              { columns: [
                { type: 'stat-card', dataKey: 'agents', span: 3 },
                { type: 'stat-card', dataKey: 'plans', span: 3 },
                { type: 'stat-card', dataKey: 'tasks', span: 3 },
                { type: 'stat-card', dataKey: 'uptime', span: 3 },
              ]},
            ],
          }}
          data={{
            agents: { value: 12, label: 'Active Agents' },
            plans: { value: 3, label: 'Running Plans' },
            tasks: { value: 847, label: 'Tasks Completed' },
            uptime: { value: '99.8%', label: 'Uptime' },
          }}
          renderWidget={(widget, data) => {
            const d = data as { value: string | number; label: string } | undefined;
            return (
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{d?.label ?? widget.dataKey}</p>
                <p className="text-2xl font-bold text-foreground">{d?.value ?? '-'}</p>
              </div>
            );
          }}
        />
      </Card>
    </div>
  );
}
