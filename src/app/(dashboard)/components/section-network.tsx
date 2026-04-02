'use client';

import {
  MnMeshNetwork, MnHubSpoke, MnDeploymentTable,
  MnAuditLog, MnActiveMissions, MnNightJobs,
} from '@/components/maranello';
import {
  meshNodes, meshEdges, hubSpokeHub, hubSpokeSpokes,
  deployments, auditEntries, missions, nightJobs,
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

export function SectionNetwork() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-mesh-network" desc="Interactive mesh topology visualization">
        <div className="h-64">
          <MnMeshNetwork nodes={meshNodes} edges={meshEdges} ariaLabel="Convergio mesh topology" />
        </div>
      </Card>

      <Card name="mn-hub-spoke" desc="Hub-and-spoke network diagram">
        <div className="h-64">
          <MnHubSpoke hub={hubSpokeHub} spokes={hubSpokeSpokes} ariaLabel="Coordinator topology" />
        </div>
      </Card>

      <Card name="mn-deployment-table" desc="Deployment status table with version tracking" wide>
        <MnDeploymentTable deployments={deployments} ariaLabel="Node deployments" />
      </Card>

      <Card name="mn-audit-log" desc="Chronological audit trail with actor tracking" wide>
        <MnAuditLog entries={auditEntries} ariaLabel="Platform audit log" />
      </Card>

      <Card name="mn-active-missions" desc="Mission tracker with progress and agent assignment">
        <MnActiveMissions missions={missions} ariaLabel="Active missions" />
      </Card>

      <Card name="mn-night-jobs" desc="Scheduled job monitor with run status">
        <MnNightJobs jobs={nightJobs} ariaLabel="Night job schedule" />
      </Card>
    </div>
  );
}
