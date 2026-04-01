'use client';

import {
  MnAugmentedBrain,
  MnBinnacle,
  MnDashboardStrip,
  MnInstrumentBinnacle,
  MnOrgChart,
} from '@/components/maranello';
import {
  brainNodes,
  brainConnections,
  binnacleEntries,
  stripMetrics,
  orgTree,
} from './showcase-data';

/** Section: W4 Agentic & Intelligence components. */
export function ShowcaseAgentic() {
  return (
    <section aria-labelledby="section-agentic">
      <h2 id="section-agentic" className="text-lg font-semibold mb-4">
        W4 — Agentic & Intelligence
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dashboard Strip */}
        <div className="rounded-lg border p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnDashboardStrip</h3>
          <MnDashboardStrip metrics={stripMetrics} ariaLabel="Platform health metrics" />
        </div>

        {/* Augmented Brain */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnAugmentedBrain</h3>
          <MnAugmentedBrain
            nodes={brainNodes}
            connections={brainConnections}
            ariaLabel="Agent cognitive architecture"
          />
        </div>

        {/* Org Chart */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnOrgChart</h3>
          <MnOrgChart tree={orgTree} ariaLabel="Platform agent hierarchy" />
        </div>

        {/* Binnacle */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnBinnacle</h3>
          <MnBinnacle entries={binnacleEntries} ariaLabel="System event log" />
        </div>

        {/* Instrument Binnacle */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnInstrumentBinnacle</h3>
          <MnInstrumentBinnacle
            entries={binnacleEntries}
            metrics={stripMetrics.slice(0, 3)}
            ariaLabel="Combined instrument panel"
          />
        </div>
      </div>
    </section>
  );
}
