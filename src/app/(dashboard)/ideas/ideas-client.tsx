"use client";

import { useState } from "react";
import { useApiQuery } from "@/hooks";
import { ideasApi } from "@/lib/api";
import type { Idea } from "@/lib/api";
import {
  MnKanbanBoard,
  MnDataTable,
  MnBadge,
  MnSpinner,
  MnTabs,
  MnTabList,
  MnTab,
  MnTabPanel,
} from "@/components/maranello";
import type { DataTableColumn, KanbanColumn, KanbanCard } from "@/components/maranello";
import { CreateIdeaDialog } from "./create-idea-dialog";

interface IdeasClientProps {
  initialIdeas: Idea[] | null;
}

type IdeaRow = Record<string, unknown> & {
  id: string;
  title: string;
  status: string;
  author: string;
  votes: number;
  created: string;
};

const tableColumns: DataTableColumn<IdeaRow>[] = [
  { key: "title", label: "Idea", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (val) => {
      const toneMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
        new: "info",
        evaluating: "warning",
        approved: "success",
        rejected: "danger",
        promoted: "success",
      };
      return <MnBadge label={String(val)} tone={toneMap[String(val)] ?? "neutral"} />;
    },
  },
  { key: "author", label: "Author" },
  { key: "votes", label: "Votes", align: "right", sortable: true },
  { key: "created", label: "Created", sortable: true },
];

const kanbanColumns: KanbanColumn[] = [
  { id: "new", title: "New" },
  { id: "evaluating", title: "Evaluating" },
  { id: "approved", title: "Approved" },
  { id: "promoted", title: "Promoted" },
];

export function IdeasClient({ initialIdeas }: IdeasClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const { data: ideas, loading, refetch } = useApiQuery(
    () => ideasApi.listIdeas(),
    { pollInterval: 30000 },
  );

  const ideaList = ideas ?? initialIdeas;

  if (!ideaList && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <MnSpinner size="lg" label="Loading ideas..." />
      </div>
    );
  }

  const rows: IdeaRow[] = (ideaList ?? []).map((i) => ({
    id: i.id,
    title: i.title,
    status: i.status,
    author: i.author,
    votes: i.votes,
    created: new Date(i.createdAt).toLocaleDateString(),
  }));

  const kanbanCards: KanbanCard[] = (ideaList ?? []).map((i) => ({
    id: i.id,
    columnId: i.status,
    title: i.title,
    description: i.description.slice(0, 100),
    assignee: i.author,
    tags: i.tags,
  }));

  async function handlePromote(ideaId: string) {
    try {
      await ideasApi.promoteIdea(ideaId);
      refetch();
    } catch {
      // handled silently
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Ideas</h1>
          <p className="text-caption mt-1">Capture and evaluate ideas</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
        >
          New Idea
        </button>
      </div>

      <MnTabs defaultValue="board">
        <MnTabList>
          <MnTab value="board">Board</MnTab>
          <MnTab value="table">Table</MnTab>
        </MnTabList>

        <MnTabPanel value="board">
          <div className="mt-4">
            <MnKanbanBoard
              columns={kanbanColumns}
              cards={kanbanCards}
              onCardClick={(card) => {
                const idea = ideaList?.find((i) => i.id === card.id);
                if (idea?.status === "approved") handlePromote(idea.id);
              }}
            />
          </div>
        </MnTabPanel>

        <MnTabPanel value="table">
          <div className="rounded-lg border border-border bg-card p-4 mt-4">
            <MnDataTable columns={tableColumns} data={rows} pageSize={10} />
          </div>
        </MnTabPanel>
      </MnTabs>

      {showCreate && (
        <CreateIdeaDialog
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
