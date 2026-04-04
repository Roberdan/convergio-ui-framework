'use client';

import { useMemo } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import type { MeshPeer, MeshStatus } from '@/lib/types';
import { meshPeers, meshStatus } from '@/lib/api-ext';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnDataTable, type DataTableColumn, MnBadge } from '@/components/maranello/data-display';
import { MnHubSpoke, type HubSpokeHub, type HubSpokeSpoke } from '@/components/maranello/agentic';
import { MnStateScaffold } from '@/components/maranello/feedback';

const PEER_COLS: DataTableColumn[] = [
  { key: 'peer', label: 'Peer', sortable: true },
  { key: 'version', label: 'Version', sortable: true },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'last_seen_str', label: 'Last Seen', sortable: true },
];

const STATUS_TONE: Record<string, 'success' | 'danger'> = {
  online: 'success', offline: 'danger',
};

export default function MeshPage() {
  const { data: peers, loading, error, refetch } = useApiQuery<MeshPeer[]>(
    meshPeers,
    { pollInterval: 15_000 },
  );
  const { data: status } = useApiQuery<MeshStatus>(
    meshStatus,
    { pollInterval: 15_000 },
  );

  const tableData = useMemo(
    () => (peers ?? []).map((p) => ({
      ...p,
      last_seen_str: new Date(p.last_seen * 1000).toLocaleString(),
    })),
    [peers],
  );

  const hub: HubSpokeHub = { label: 'This Node', status: 'online' };
  const spokes: HubSpokeSpoke[] = useMemo(
    () => (peers ?? []).map((p) => ({
      label: p.peer,
      status: p.status === 'online' ? ('online' as const) : ('offline' as const),
      connected: p.status === 'online',
    })),
    [peers],
  );

  const onlinePeers = (peers ?? []).filter((p) => p.status === 'online').length;
  const totalPeers = (peers ?? []).length;

  if (loading) return <MnStateScaffold state="loading" message="Loading mesh peers..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Mesh Network</h1>
        <MnBadge tone={(peers ?? []).some((p) => p.status === 'offline') ? 'warning' : 'success'}>
          {onlinePeers}/{totalPeers} online
        </MnBadge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total Peers" value={totalPeers} />
        <KpiCard label="Online" value={onlinePeers} />
        <KpiCard label="Offline" value={totalPeers - onlinePeers}
          warn={totalPeers > 0 && onlinePeers < totalPeers} />
        <KpiCard label="Total Synced" value={status?.total_synced ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MnSectionCard title="Network Topology" collapsible defaultOpen>
          <div className="flex items-center justify-center p-4">
            <MnHubSpoke hub={hub} spokes={spokes} />
          </div>
        </MnSectionCard>

        <MnSectionCard title="Peer Versions" collapsible defaultOpen>
          <div className="space-y-2 p-4">
            {(peers ?? []).map((p) => (
              <div key={p.peer} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <span className="text-sm font-medium">{p.peer}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{p.version ?? 'unknown'}</span>
                  <MnBadge tone={STATUS_TONE[p.status] ?? 'danger'}>{p.status}</MnBadge>
                </div>
              </div>
            ))}
            {(peers ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No peers discovered</p>
            )}
          </div>
        </MnSectionCard>
      </div>

      <MnSectionCard title="All Peers" badge={totalPeers} collapsible defaultOpen>
        <MnDataTable
          columns={PEER_COLS}
          data={tableData as unknown as Record<string, unknown>[]}
          emptyMessage="No mesh peers"
        />
      </MnSectionCard>

      <MnSectionCard title="Recent Activity" collapsible defaultOpen>
        <div className="space-y-2 p-4">
          {(peers ?? []).sort((a, b) => b.last_seen - a.last_seen).map((p) => (
            <div key={p.peer} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
              <MnBadge tone={STATUS_TONE[p.status] ?? 'danger'}>{p.status}</MnBadge>
              <span className="text-sm font-medium">{p.peer}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(p.last_seen * 1000).toLocaleString()}
              </span>
              {p.version && (
                <span className="font-mono text-xs text-muted-foreground">{p.version}</span>
              )}
            </div>
          ))}
          {(peers ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No peer activity</p>
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
