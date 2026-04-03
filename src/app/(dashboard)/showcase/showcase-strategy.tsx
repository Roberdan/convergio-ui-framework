'use client';

import {
  MnStrategyCanvas,
  MnSwot,
  MnPorterFiveForces,
  MnCustomerJourneyMap,
  MnBcgMatrix,
  MnBusinessModelCanvas,
  MnNineBoxMatrix,
  MnRiskMatrix,
  MnCustomerJourney,
  MnOkr,
} from '@/components/maranello';
import type { Objective } from '@/components/maranello';
import type { JourneyPhase } from '@/components/maranello/strategy/mn-customer-journey';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import {
  strategyCanvasSegments,
  swotData,
  porterForces,
  journeyStages,
  bcgItems,
  bmcBlocks,
  nineBoxItems,
  riskItems,
} from './showcase-strategy-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

const customerPhases: JourneyPhase[] = [
  {
    id: 'discover', label: 'Discovery',
    engagements: [
      { id: 'e1', title: 'Inbound demo request', status: 'completed', type: 'opportunity', assignee: 'Sarah Chen', date: '2025-06-01' },
      { id: 'e2', title: 'Technical deep-dive call', status: 'completed', type: 'meeting', assignee: 'Marco Silva', date: '2025-06-05' },
    ],
  },
  {
    id: 'evaluate', label: 'Evaluation',
    engagements: [
      { id: 'e3', title: 'POC environment setup', status: 'active', type: 'task', assignee: 'Arjun Patel', date: '2025-06-12' },
      { id: 'e4', title: 'Security review', status: 'pending', type: 'ticket', date: '2025-06-18' },
    ],
  },
  {
    id: 'close', label: 'Close',
    engagements: [
      { id: 'e5', title: 'Enterprise contract negotiation', status: 'pending', type: 'contract', assignee: 'Elena Vasquez', date: '2025-07-01' },
    ],
  },
];

const okrObjectives: Objective[] = [
  {
    id: 'o1', title: 'Scale mesh network to 50 nodes', status: 'on-track',
    keyResults: [
      { id: 'kr1', title: 'Deploy nodes in 3 new regions', current: 2, target: 3 },
      { id: 'kr2', title: 'Achieve 99.95% uptime SLA', current: 99.92, target: 99.95, unit: '%' },
      { id: 'kr3', title: 'Reduce inter-node latency to <50ms', current: 62, target: 50, unit: 'ms' },
    ],
  },
  {
    id: 'o2', title: 'Improve agent task completion rate',
    keyResults: [
      { id: 'kr4', title: 'Increase success rate', current: 94, target: 98, unit: '%' },
      { id: 'kr5', title: 'Reduce average resolution time', current: 45, target: 30, unit: 's' },
    ],
  },
];

/** Section: W5 Strategy & Business Frameworks. */
export function ShowcaseStrategy() {
  return (
    <section aria-labelledby="section-strategy">
      <h2 id="section-strategy" className="text-lg font-semibold mb-4">
        W5 — Strategy & Business Frameworks
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-strategy-canvas')} example={`<MnStrategyCanvas segments={segments} />`}>
            <MnStrategyCanvas segments={strategyCanvasSegments} ariaLabel="Platform strategy canvas" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-swot')} example={`<MnSwot strengths={s} weaknesses={w} opportunities={o} threats={t} />`}>
            <MnSwot
              strengths={swotData.strengths}
              weaknesses={swotData.weaknesses}
              opportunities={swotData.opportunities}
              threats={swotData.threats}
              ariaLabel="Convergio SWOT analysis"
            />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-porter-five-forces')} example={`<MnPorterFiveForces forces={forces} />`}>
            <MnPorterFiveForces forces={porterForces} ariaLabel="AI ops market forces" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-customer-journey-map')} example={`<MnCustomerJourneyMap stages={stages} />`}>
            <MnCustomerJourneyMap stages={journeyStages} ariaLabel="Enterprise client journey" />
          </ComponentDoc>
        </div>

        <ComponentDoc entry={entry('mn-bcg-matrix')} example={`<MnBcgMatrix items={items} height={280} />`}>
          <MnBcgMatrix items={bcgItems} height={280} />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-nine-box-matrix')} example={`<MnNineBoxMatrix items={items} xLabel="Performance" yLabel="Potential" />`}>
          <MnNineBoxMatrix items={nineBoxItems} xLabel="Performance" yLabel="Potential" />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-risk-matrix')} example={`<MnRiskMatrix items={items} />`}>
          <MnRiskMatrix items={riskItems} ariaLabel="Platform risk assessment" />
        </ComponentDoc>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-business-model-canvas')} example={`<MnBusinessModelCanvas blocks={blocks} editable={false} />`}>
            <MnBusinessModelCanvas blocks={bmcBlocks} editable={false} />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-customer-journey')} example={`<MnCustomerJourney phases={phases} orientation="horizontal" />`}>
            <MnCustomerJourney phases={customerPhases} orientation="horizontal" />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-okr')} example={`<MnOkr objectives={objectives} title="Q3 2025" period="Q3 2025" />`}>
            <MnOkr objectives={okrObjectives} title="Q3 2025 Objectives" period="Q3 2025" />
          </ComponentDoc>
        </div>
      </div>
    </section>
  );
}
