"use client";

import type { AgentCatalogEntry } from "@/lib/api";
import { MnDataTable, MnBadge } from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";

interface AgentCatalogProps {
  catalog: AgentCatalogEntry[] | null;
}

type CatalogRow = Record<string, unknown> & {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  capabilities: string;
};

const columns: DataTableColumn<CatalogRow>[] = [
  { key: "name", label: "Agent", sortable: true },
  { key: "description", label: "Description" },
  {
    key: "provider",
    label: "Provider",
    sortable: true,
    render: (val) => (
      <MnBadge label={String(val)} tone="info" />
    ),
  },
  { key: "model", label: "Model", sortable: true },
  {
    key: "capabilities",
    label: "Capabilities",
    render: (val) => {
      const caps = String(val).split(", ");
      return (
        <div className="flex flex-wrap gap-1">
          {caps.map((cap) => (
            <MnBadge key={cap} label={cap} tone="neutral" />
          ))}
        </div>
      );
    },
  },
];

export function AgentCatalog({ catalog }: AgentCatalogProps) {
  const rows: CatalogRow[] = (catalog ?? []).map((entry) => ({
    id: entry.id,
    name: entry.name,
    description: entry.description,
    provider: entry.provider ?? "—",
    model: entry.model ?? "—",
    capabilities: (entry.capabilities ?? []).join(", "),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnDataTable
        columns={columns}
        data={rows}
        pageSize={10}
        emptyMessage="No agents in catalog. The daemon may be offline."
      />
    </div>
  );
}
