"use client";

import { useApiQuery } from "@/hooks";
import { operationsApi } from "@/lib/api";
import type { RollbackSnapshot } from "@/lib/api";
import { MnDataTable } from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";

type SnapshotRow = Record<string, unknown> & {
  id: string;
  label: string;
  version: string;
  createdAt: string;
  size: string;
  status: string;
};

const snapshotColumns: DataTableColumn<SnapshotRow>[] = [
  { key: "label", label: "Snapshot", sortable: true },
  { key: "version", label: "Version", sortable: true },
  { key: "createdAt", label: "Created", sortable: true },
  { key: "size", label: "Size", align: "right", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface RollbackTabProps {
  initial: RollbackSnapshot[] | null;
}

export function RollbackTab({ initial }: RollbackTabProps) {
  const { data } = useApiQuery(
    () => operationsApi.getRollbackSnapshots(),
    { pollInterval: 30000 },
  );

  const snapshots = data ?? initial;

  const rows: SnapshotRow[] = (snapshots ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    version: s.version,
    createdAt: new Date(s.createdAt).toLocaleString(),
    size: formatSize(s.size),
    status: s.status,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnDataTable
        columns={snapshotColumns}
        data={rows}
        compact
        emptyMessage="No rollback snapshots available"
      />
    </div>
  );
}
