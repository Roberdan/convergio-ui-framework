"use client";

import { useState, useCallback } from "react";
import { useApiQuery } from "@/hooks";
import { workspacesApi } from "@/lib/api";
import type { Workspace, Deliverable, Repository } from "@/lib/api";
import {
  MnDashboardStrip,
  MnDataTable,
  MnBadge,
  MnDetailPanel,
  MnProgressRing,
  MnSpinner,
} from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";
import type { StripMetric } from "@/components/maranello/mn-dashboard-strip";
import type { DetailSection } from "@/components/maranello/mn-detail-panel";
import { FolderKanban } from "lucide-react";
import { CreateProjectDialog } from "./create-project-dialog";

interface ProjectsClientProps {
  initialWorkspaces: Workspace[] | null;
  initialDeliverables: Deliverable[] | null;
  initialRepositories: Repository[] | null;
}

type WorkspaceRow = Record<string, unknown> & {
  id: string;
  name: string;
  status: string;
  description: string;
  repoCount: number;
  createdAt: string;
};

const statusTone: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  active: "success",
  inactive: "neutral",
  archived: "warning",
  creating: "info",
};

const columns: DataTableColumn<WorkspaceRow>[] = [
  { key: "name", label: "Project", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (v) => (
      <MnBadge label={String(v)} tone={statusTone[String(v)] ?? "neutral"} />
    ),
  },
  { key: "description", label: "Description" },
  { key: "repoCount", label: "Repos", align: "right", sortable: true },
  { key: "createdAt", label: "Created", sortable: true },
];

export function ProjectsClient({
  initialWorkspaces,
  initialDeliverables,
  initialRepositories,
}: ProjectsClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: workspaces, refetch } = useApiQuery(
    () => workspacesApi.listWorkspaces(),
    { pollInterval: 15_000 },
  );
  const { data: deliverables } = useApiQuery(
    () => workspacesApi.getDeliverables(),
    { pollInterval: 30_000 },
  );
  const { data: repositories } = useApiQuery(
    () => workspacesApi.listRepositories(),
    { pollInterval: 30_000 },
  );

  const ws = workspaces ?? initialWorkspaces;
  const dl = deliverables ?? initialDeliverables;
  const repos = repositories ?? initialRepositories;

  const handleRowClick = useCallback((row: WorkspaceRow) => {
    setSelectedId(row.id);
  }, []);

  if (!ws) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading projects..." />
      </div>
    );
  }

  const activeCount = ws.filter((w) => w.status === "active").length;

  const metrics: StripMetric[] = [
    { label: "Total Projects", value: String(ws.length) },
    { label: "Active", value: String(activeCount) },
    { label: "Deliverables", value: String(dl?.length ?? 0) },
    { label: "Repositories", value: String(repos?.length ?? 0) },
  ];

  const rows: WorkspaceRow[] = ws.map((w) => ({
    id: w.id,
    name: w.name,
    status: w.status,
    description: w.description ?? "",
    repoCount: w.repositoryCount ?? 0,
    createdAt: new Date(w.createdAt).toLocaleDateString(),
  }));

  const selected = selectedId ? ws.find((w) => w.id === selectedId) : null;
  const selectedDeliverables = selectedId
    ? (dl ?? []).filter((d) => d.workspaceId === selectedId)
    : [];
  const completedDl = selectedDeliverables.filter((d) => d.status === "completed").length;
  const totalDl = selectedDeliverables.length;
  const progress = totalDl > 0 ? Math.round((completedDl / totalDl) * 100) : 0;

  const detailSections: DetailSection[] = selected
    ? [
        {
          title: "Overview",
          fields: [
            { key: "name", label: "Name", value: selected.name, type: "readonly" as const },
            { key: "status", label: "Status", value: selected.status, type: "readonly" as const },
            { key: "created", label: "Created", value: selected.createdAt, type: "date" as const },
            { key: "desc", label: "Description", value: selected.description ?? "—", type: "readonly" as const },
          ],
        },
        {
          title: "Deliverables",
          fields: selectedDeliverables.map((d) => ({
            key: d.id,
            label: d.name,
            value: d.status,
            type: "readonly" as const,
          })),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1>Projects</h1>
            <p className="text-caption mt-1">
              Manage your workspaces and repositories.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          New Project
        </button>
      </div>

      <MnDashboardStrip metrics={metrics} ariaLabel="Project metrics" />

      <div className="rounded-lg border border-border bg-card p-4">
        <MnDataTable
          columns={columns}
          data={rows}
          pageSize={10}
          onRowClick={handleRowClick}
          emptyMessage="No projects yet. Create one to get started."
        />
      </div>

      {selected && (
        <MnDetailPanel
          open={!!selectedId}
          onOpenChange={(open) => { if (!open) setSelectedId(null); }}
          title={selected.name}
          sections={detailSections}
        >
          {totalDl > 0 && (
            <div className="flex items-center gap-3 px-4 py-3">
              <MnProgressRing value={progress} size="sm" label="Completion" />
              <span className="text-sm text-muted-foreground">
                {completedDl}/{totalDl} deliverables completed
              </span>
            </div>
          )}
        </MnDetailPanel>
      )}

      {showCreate && (
        <CreateProjectDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
