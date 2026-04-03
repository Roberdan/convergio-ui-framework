"use client";

/**
 * A2UIBlockRenderer — renders an A2UIBlock based on its block_type.
 *
 * Each block type maps to themed UI using existing design tokens.
 * Dismiss button on every block posts to daemon and removes from store.
 */

import { X } from "lucide-react";
import type { A2UIBlock, A2UIBlockPayload } from "@/lib/a2ui/types";
import { useA2UIDispatch, dismissBlock as dismissFromStore } from "@/lib/a2ui";

const DAEMON_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8420";

async function dismissOnServer(blockId: string) {
  try {
    await fetch(`${DAEMON_URL}/api/a2ui/dismiss/${blockId}`, {
      method: "POST",
    });
  } catch {
    console.error(`[a2ui] failed to dismiss block ${blockId}`);
  }
}

export function A2UIBlockRenderer({ block }: { block: A2UIBlock }) {
  const dispatch = useA2UIDispatch();

  function handleDismiss() {
    dismissFromStore(dispatch, block.block_id);
    dismissOnServer(block.block_id);
  }

  return (
    <div className="relative group rounded-lg border border-border bg-card/95 backdrop-blur-sm shadow-lg" role="status" aria-live="polite">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-muted"
        aria-label={`Dismiss block from ${block.agent_id}`}
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      <BlockContent payload={block.block} agentId={block.agent_id} />
    </div>
  );
}

/* ── Block type renderers ── */

function BlockContent({
  payload,
  agentId,
}: {
  payload: A2UIBlockPayload;
  agentId: string;
}) {
  switch (payload.type) {
    case "notification":
      return (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="font-medium text-sm">{payload.title}</p>
          {payload.body && (
            <p className="text-sm text-muted-foreground mt-1">{payload.body}</p>
          )}
          <AgentTag agentId={agentId} />
        </div>
      );

    case "alert":
      return (
        <div
          className={`rounded-lg border p-4 ${SEVERITY_STYLES[payload.severity]}`}
        >
          <p className="font-medium text-sm">{payload.title}</p>
          {payload.body && <p className="text-sm mt-1">{payload.body}</p>}
          <AgentTag agentId={agentId} />
        </div>
      );

    case "progress":
      return (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{payload.title}</span>
            <span className="text-muted-foreground">
              {payload.label ?? `${payload.percent}%`}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(payload.percent, 100)}%` }}
              role="progressbar"
              aria-valuenow={payload.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <AgentTag agentId={agentId} />
        </div>
      );

    case "card":
      return (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="font-medium text-sm">{payload.title}</p>
          {payload.body && (
            <p className="text-sm text-muted-foreground mt-1">{payload.body}</p>
          )}
          <AgentTag agentId={agentId} />
        </div>
      );

    case "chart":
      return (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="font-medium text-sm">{payload.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {payload.chart_type} chart &middot; {payload.data.length} points
          </p>
          <AgentTag agentId={agentId} />
        </div>
      );

    case "table":
      return (
        <div className="rounded-lg border bg-card p-4 text-card-foreground overflow-x-auto">
          <p className="font-medium text-sm mb-2">{payload.title}</p>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {payload.columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-2 py-1 text-muted-foreground font-medium border-b"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.rows.map((row, i) => (
                <tr key={i}>
                  {payload.columns.map((col) => (
                    <td key={col} className="px-2 py-1 border-b border-border">
                      {String(row[col] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <AgentTag agentId={agentId} />
        </div>
      );

    default:
      return null;
  }
}

/* ── Shared sub-components ── */

function AgentTag({ agentId }: { agentId: string }) {
  return (
    <p className="text-[10px] text-muted-foreground mt-2 font-mono">
      {agentId}
    </p>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-status-info/10 border-status-info/30 text-card-foreground",
  warning: "bg-status-warning/10 border-status-warning/30 text-card-foreground",
  error: "bg-status-error/10 border-status-error/30 text-card-foreground",
  success: "bg-status-success/10 border-status-success/30 text-card-foreground",
};
