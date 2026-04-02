"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks";
import { orgsApi } from "@/lib/api";
import type { Organization } from "@/lib/api";
import { MnDataTable, MnSpinner } from "@/components/maranello";
import type { DataTableColumn } from "@/components/maranello";
import { CreateOrgDialog } from "./create-org-dialog";

interface OrgsListClientProps {
  initialOrgs: Organization[] | null;
}

type OrgRow = Record<string, unknown> & {
  id: string;
  name: string;
  slug: string;
  members: number;
  created: string;
};

const columns: DataTableColumn<OrgRow>[] = [
  { key: "name", label: "Organization", sortable: true },
  { key: "slug", label: "Slug" },
  { key: "members", label: "Members", align: "right", sortable: true },
  { key: "created", label: "Created", sortable: true },
];

export function OrgsListClient({ initialOrgs }: OrgsListClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const { data: orgs, loading, refetch } = useApiQuery(
    () => orgsApi.listOrgs(),
    { pollInterval: 30000 },
  );

  const orgList = orgs ?? initialOrgs;

  if (!orgList && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading organizations..." />
      </div>
    );
  }

  const rows: OrgRow[] = (orgList ?? []).map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    members: o.memberCount,
    created: new Date(o.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Organizations</h1>
          <p className="text-caption mt-1">Virtual organizations and teams</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
        >
          Create Organization
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <MnDataTable
          columns={columns}
          data={rows}
          pageSize={10}
          onRowClick={(row) => {
            window.location.href = `/orgs/${row.id}`;
          }}
          emptyMessage="No organizations found"
        />
      </div>

      {showCreate && (
        <CreateOrgDialog
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
