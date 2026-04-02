'use client';

import {
  MnAugmentedBrain, MnBinnacle, MnDashboardStrip,
  MnInstrumentBinnacle, MnOrgChart,
} from '@/components/maranello';
import {
  brainNodes, brainConnections, binnacleEntries,
  stripMetrics, orgTree,
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

export function SectionAgentic() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-augmented-brain" desc="Neural network visualization for AI agent capabilities">
        <div className="h-64">
          <MnAugmentedBrain
            nodes={brainNodes}
            connections={brainConnections}
            ariaLabel="Jarvis cognitive architecture"
          />
        </div>
      </Card>

      <Card name="mn-binnacle" desc="Operational event log with severity filtering">
        <MnBinnacle entries={binnacleEntries} ariaLabel="System event log" />
      </Card>

      <Card name="mn-dashboard-strip" desc="Compact horizontal metric strip with trends" wide>
        <MnDashboardStrip metrics={stripMetrics} ariaLabel="Platform metrics" />
      </Card>

      <Card name="mn-instrument-binnacle" desc="Combined metrics strip + event log panel" wide>
        <MnInstrumentBinnacle
          entries={binnacleEntries}
          metrics={stripMetrics}
          ariaLabel="Operations instrument panel"
        />
      </Card>

      <Card name="mn-org-chart" desc="Hierarchical organization tree with status indicators" wide>
        <div className="overflow-x-auto">
          <MnOrgChart tree={orgTree} ariaLabel="Convergio agent hierarchy" />
        </div>
      </Card>
    </div>
  );
}
