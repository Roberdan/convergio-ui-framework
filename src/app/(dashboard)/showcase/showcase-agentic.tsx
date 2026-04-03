'use client';

import {
  MnAugmentedBrain,
  MnBinnacle,
  MnChat,
  MnDashboardStrip,
  MnInstrumentBinnacle,
  MnOrgChart,
} from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import {
  brainNodes,
  brainConnections,
  binnacleEntries,
  stripMetrics,
  orgTree,
} from './showcase-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

/** Section: W4 Agentic & Intelligence components. */
export function ShowcaseAgentic() {
  return (
    <section aria-labelledby="section-agentic">
      <h2 id="section-agentic" className="text-lg font-semibold mb-4">
        W4 — Agentic & Intelligence
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-dashboard-strip')}
            example={`<MnDashboardStrip metrics={metrics} ariaLabel="Health metrics" />`}
          >
            <MnDashboardStrip metrics={stripMetrics} ariaLabel="Platform health metrics" />
          </ComponentDoc>
        </div>

        <ComponentDoc
          entry={entry('mn-augmented-brain')}
          example={`<MnAugmentedBrain nodes={nodes} connections={conns} />`}
        >
          <MnAugmentedBrain
            nodes={brainNodes}
            connections={brainConnections}
            ariaLabel="Agent cognitive architecture"
          />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-org-chart')}
          example={`<MnOrgChart tree={tree} ariaLabel="Agent hierarchy" />`}
        >
          <MnOrgChart tree={orgTree} ariaLabel="Platform agent hierarchy" />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-binnacle')}
          example={`<MnBinnacle entries={entries} ariaLabel="Event log" />`}
        >
          <MnBinnacle entries={binnacleEntries} ariaLabel="System event log" />
        </ComponentDoc>

        <ComponentDoc
          entry={entry('mn-instrument-binnacle')}
          example={`<MnInstrumentBinnacle entries={entries} metrics={metrics} />`}
        >
          <MnInstrumentBinnacle
            entries={binnacleEntries}
            metrics={stripMetrics.slice(0, 3)}
            ariaLabel="Combined instrument panel"
          />
        </ComponentDoc>

        <div className="md:col-span-2">
          <ComponentDoc
            entry={entry('mn-chat')}
            example={`<MnChat messages={msgs} onSend={handleSend} placeholder="Ask..." />`}
          >
            <div className="h-80">
              <MnChat
                messages={[
                  { id: '1', role: 'user', content: 'Summarize the Q2 agent performance metrics.' },
                  { id: '2', role: 'assistant', content: 'Here\'s the Q2 summary:\n\n**Total tasks completed:** 12,847\n**Average latency:** 230ms\n**Success rate:** 98.4%\n\nThe orchestrator routed 67% of requests to the primary model and 33% to the fallback.' },
                  { id: '3', role: 'user', content: 'Which agents had the highest error rates?' },
                ]}
                quickActions={[
                  { label: 'Show details', action: 'details' },
                  { label: 'Export report', action: 'export' },
                ]}
                placeholder="Ask about agent performance..."
                onSend={() => {}}
              />
            </div>
          </ComponentDoc>
        </div>
      </div>
    </section>
  );
}
