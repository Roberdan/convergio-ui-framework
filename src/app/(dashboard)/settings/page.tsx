'use client';

import { useMemo, useState } from 'react';
import { useApiQuery } from '@/hooks/use-api-query';
import * as api from '@/lib/api';
import type { ExtensionInfo, DepGraph, AuditEntry } from '@/lib/types';
import { MnSectionCard } from '@/components/maranello/layout';
import { MnDataTable, type DataTableColumn, MnBadge } from '@/components/maranello/data-display';
import { MnStateScaffold } from '@/components/maranello/feedback';
import { MnHubSpoke, type HubSpokeHub, type HubSpokeSpoke } from '@/components/maranello/agentic';

const EXT_COLS: DataTableColumn[] = [
  { key: 'id', label: 'Extension', sortable: true },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'capabilities', label: 'Capabilities' },
];

const AUDIT_COLS: DataTableColumn[] = [
  { key: 'timestamp', label: 'Time', sortable: true },
  { key: 'action', label: 'Action', sortable: true },
  { key: 'actor', label: 'Actor', sortable: true },
  { key: 'org_id', label: 'Org' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<'config' | 'extensions' | 'depgraph' | 'security'>('config');

  const { data: extensions, loading, error, refetch } = useApiQuery<ExtensionInfo[]>(api.extensionList);
  const { data: depgraph } = useApiQuery<DepGraph>(api.depgraph);
  const { data: depValidation } = useApiQuery(api.depgraphValidate);
  const { data: audit } = useApiQuery<AuditEntry[]>(() => api.tenancyAudit({ limit: 50 }));

  const depHub: HubSpokeHub = { label: 'Core', status: 'online' };
  const depSpokes: HubSpokeSpoke[] = useMemo(
    () => (depgraph?.nodes ?? []).slice(0, 12).map((n) => ({
      label: n.label,
      status: 'online' as const,
      connected: true,
    })),
    [depgraph],
  );

  const healthyExts = (extensions ?? []).filter((e) => e.status === 'healthy' || e.status === 'active').length;

  if (loading) return <MnStateScaffold state="loading" message="Loading settings..." />;
  if (error) return <MnStateScaffold state="error" message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-2">
        {(['config', 'extensions', 'depgraph', 'security'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>
            {t === 'config' ? 'Configuration' : t === 'extensions' ? 'Extensions' : t === 'depgraph' ? 'Dependencies' : 'Security'}
          </button>
        ))}
      </div>

      {tab === 'config' && (
        <MnSectionCard title="Platform Configuration" collapsible defaultOpen>
          <div className="space-y-4 p-4">
            <ConfigRow label="API Base URL" value="http://localhost:8420" reloadable />
            <ConfigRow label="Theme" value="navy" reloadable />
            <ConfigRow label="SSE Endpoint" value="/api/events/stream" reloadable />
            <ConfigRow label="Auth Mode" value="JWT" restart />
            <ConfigRow label="Max Concurrent Agents" value="50" restart />
            <ConfigRow label="Rate Limit" value="100 req/min" reloadable />
          </div>
        </MnSectionCard>
      )}

      {tab === 'extensions' && (
        <MnSectionCard title="Extensions" badge={(extensions ?? []).length} collapsible defaultOpen
          action={{ label: 'Refresh', onClick: refetch }}>
          <div className="mb-3 px-4">
            <MnBadge tone={healthyExts === (extensions ?? []).length ? 'success' : 'warning'}>
              {healthyExts}/{(extensions ?? []).length} healthy
            </MnBadge>
          </div>
          <MnDataTable
            columns={EXT_COLS}
            data={(extensions ?? []).map((e) => ({
              ...e,
              capabilities: e.capabilities.join(', '),
            })) as unknown as Record<string, unknown>[]}
            emptyMessage="No extensions registered"
          />
        </MnSectionCard>
      )}

      {tab === 'depgraph' && (
        <div className="space-y-6">
          <MnSectionCard title="Dependency Graph" collapsible defaultOpen>
            <div className="flex items-center justify-center p-4">
              <MnHubSpoke hub={depHub} spokes={depSpokes} />
            </div>
            <div className="border-t px-4 py-3">
              <p className="text-sm">
                <strong>{depgraph?.nodes.length ?? 0}</strong> nodes,{' '}
                <strong>{depgraph?.edges.length ?? 0}</strong> edges
              </p>
            </div>
          </MnSectionCard>

          <MnSectionCard title="Validation" collapsible defaultOpen>
            <div className="p-4">
              {depValidation && (
                <div className="flex items-center gap-3">
                  <MnBadge tone={depValidation.valid ? 'success' : 'danger'}>
                    {depValidation.valid ? 'Valid' : 'Invalid'}
                  </MnBadge>
                  {depValidation.errors.length > 0 && (
                    <ul className="list-inside list-disc text-sm text-destructive">
                      {depValidation.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </MnSectionCard>
        </div>
      )}

      {tab === 'security' && (
        <MnSectionCard title="Audit Trail" badge={(audit ?? []).length} collapsible defaultOpen>
          <MnDataTable
            columns={AUDIT_COLS}
            data={(audit ?? []) as unknown as Record<string, unknown>[]}
            emptyMessage="No audit entries"
          />
        </MnSectionCard>
      )}
    </div>
  );
}

function ConfigRow({ label, value, reloadable, restart }: {
  label: string; value: string; reloadable?: boolean; restart?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <div>
        <span className="text-sm font-medium">{label}</span>
        {restart && <MnBadge tone="warning" className="ml-2">Restart required</MnBadge>}
        {reloadable && <MnBadge tone="success" className="ml-2">Hot reload</MnBadge>}
      </div>
      <span className="font-mono text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
