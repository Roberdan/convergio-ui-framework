'use client';

import {
  MnMeshNetwork,
  MnHubSpoke,
  MnDeploymentTable,
  MnAuditLog,
  MnActiveMissions,
  MnNightJobs,
} from '@/components/maranello';
import {
  meshNodes,
  meshEdges,
  hubSpokeHub,
  hubSpokeSpokes,
  deployments,
  auditEntries,
  missions,
  nightJobs,
} from './showcase-data';

/** Section: W3 Network & Infrastructure components. */
export function ShowcaseNetwork() {
  return (
    <section aria-labelledby="section-network">
      <h2 id="section-network" className="text-lg font-semibold mb-4">
        W3 — Network & Infrastructure
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mesh Network */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnMeshNetwork</h3>
          <MnMeshNetwork nodes={meshNodes} edges={meshEdges} ariaLabel="Convergio mesh topology" />
        </div>

        {/* Hub & Spoke */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnHubSpoke</h3>
          <MnHubSpoke hub={hubSpokeHub} spokes={hubSpokeSpokes} ariaLabel="Coordinator hub topology" />
        </div>

        {/* Deployment Table */}
        <div className="rounded-lg border p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnDeploymentTable</h3>
          <MnDeploymentTable deployments={deployments} ariaLabel="Node deployment status" />
        </div>

        {/* Audit Log */}
        <div className="rounded-lg border p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnAuditLog</h3>
          <MnAuditLog entries={auditEntries} ariaLabel="Platform audit trail" />
        </div>

        {/* Active Missions */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnActiveMissions</h3>
          <MnActiveMissions missions={missions} ariaLabel="Current mission status" />
        </div>

        {/* Night Jobs */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnNightJobs</h3>
          <MnNightJobs jobs={nightJobs} ariaLabel="Scheduled batch operations" />
        </div>
      </div>
    </section>
  );
}
