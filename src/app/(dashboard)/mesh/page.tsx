'use client';

import { useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as api from '@/lib/api';
import type { MeshNode } from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnDataTable, type DataTableColumn, MnBadge } from '@/components/maranello/data-display';
import { MnHubSpoke, type HubSpokeHub, type HubSpokeSpoke } from '@/components/maranello/agentic';
import { MnStateScaffold } from '@/components/maranello/feedback';

const NODE_COLS: DataTableColumn[] = [
  { key: 'name', label: 'Node', sortable: true },
  { key: 'url', label: 'URL' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'schema_version', label: 'Schema', sortable: true },
  { key: 'latency_ms', label: 'Latency (ms)', sortable: true },
  { key: 'last_sync', label: 'Last Sync', sortable: true },
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  online: 'success', syncing: 'warning', offline: 'danger',
};

export default function MeshPage() {
  const { data: nodes, loading, error, refetch } = useApiQuery<MeshNode[]>(
    api.meshNodes,
    { pollInterval: 15_000 },
  );

  const hub: HubSpokeHub = { label: 'This Node', status: 'online' };
  const spokes: HubSpokeSpoke[] = useMemo(
    () => (nodes ?? []).map((n) => ({
      label: n.name,
      status: n.status === 'online' ? 'online' as const : n.status === 'syncing' ? 'degraded' as const : 'offline' as const,
      connected: n.status !== 'offline',
    })),
    [nodes],
  );

  const schemaVersions = useMemo(() => {
    const versions = new Set((nodes ?? []).map((n) => n.schema_version).filter(Boolean));
    return [...versions];
  }, [nodes]);

  const hasMismatch = schemaVersions.length > 1;

  if (loading) return <MnStateScaffold state="loading" message="Loading mesh nodes..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Mesh Network</h1>
        <MnBadge tone={(nodes ?? []).some((n) => n.status === 'offline') ? 'warning' : 'success'}>
          {(nodes ?? []).filter((n) => n.status === 'online').length}/{(nodes ?? []).length} online
        </MnBadge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total Nodes" value={(nodes ?? []).length} />
        <KpiCard label="Online" value={(nodes ?? []).filter((n) => n.status === 'online').length} />
        <KpiCard label="Syncing" value={(nodes ?? []).filter((n) => n.status === 'syncing').length} />
        <KpiCard label="Offline" value={(nodes ?? []).filter((n) => n.status === 'offline').length}
          warn={(nodes ?? []).some((n) => n.status === 'offline')} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Network Topology" collapsible defaultOpen>
          <div className="flex items-center justify-center p-4">
            <MnHubSpoke hub={hub} spokes={spokes} />
          </div>
        </MnSectionCard>

        <MnSectionCard title="Schema Versions" collapsible defaultOpen>
          <div className="space-y-2 p-4">
            {hasMismatch && (
              <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Schema version mismatch detected across nodes
              </div>
            )}
            {(nodes ?? []).map((n) => (
              <div key={n.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <span className="text-sm font-medium">{n.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{n.schema_version ?? 'unknown'}</span>
                  <MnBadge tone={STATUS_TONE[n.status] ?? 'danger'}>{n.status}</MnBadge>
                </div>
              </div>
            ))}
            {(nodes ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No nodes discovered</p>
            )}
          </div>
        </MnSectionCard>
      </div>

      <MnSectionCard title="All Nodes" badge={(nodes ?? []).length} collapsible defaultOpen>
        <MnDataTable
          columns={NODE_COLS}
          data={(nodes ?? []) as unknown as Record<string, unknown>[]}
          onRowClick={(row) => {
            const node = row as unknown as MeshNode;
            alert(`Node: ${node.name}\nURL: ${node.url}\nLast sync: ${node.last_sync ?? 'never'}`);
          }}
          emptyMessage="No mesh nodes"
        />
      </MnSectionCard>

      <MnSectionCard title="Sync Timeline" collapsible defaultOpen>
        <div className="space-y-2 p-4">
          {(nodes ?? []).filter((n) => n.last_sync).sort((a, b) =>
            new Date(b.last_sync!).getTime() - new Date(a.last_sync!).getTime()
          ).map((n) => (
            <div key={n.id} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
              <MnBadge tone={STATUS_TONE[n.status] ?? 'danger'}>{n.status}</MnBadge>
              <span className="text-sm font-medium">{n.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(n.last_sync!).toLocaleString()}
              </span>
              {n.latency_ms != null && (
                <span className="text-xs tabular-nums text-muted-foreground">{n.latency_ms}ms</span>
              )}
            </div>
          ))}
          {(nodes ?? []).filter((n) => n.last_sync).length === 0 && (
            <p className="text-sm text-muted-foreground">No sync events</p>
          )}
        </div>
      </MnSectionCard>
    </div>
  );
}

function KpiCard({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${warn ? 'text-destructive' : ''}`}>{value}</p>
    </div>
  );
}
