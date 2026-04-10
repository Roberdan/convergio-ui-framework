'use client';

import type { IpcEvent } from '@/lib/types';

export function KpiCard({
  label, value, sub, warn,
}: {
  label: string; value: string | number; sub?: string; warn?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${warn ? 'text-destructive' : ''}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function AgentMessagesList({ events }: { events: IpcEvent[] }) {
  return (
    <div className="max-h-64 overflow-y-auto p-4">
      {events.slice(0, 50).map((e, i) => (
        <div
          key={`${e.ts}-${i}`}
          className="flex gap-2 border-b border-border py-2 last:border-0"
        >
          <span className="shrink-0 text-xs font-semibold text-primary">
            {e.from}
          </span>
          {e.to && (
            <span className="text-xs text-muted-foreground">&rarr; {e.to}</span>
          )}
          <span className="flex-1 text-xs text-foreground">{e.content}</span>
          <span className="shrink-0 text-[0.65rem] text-muted-foreground tabular-nums">
            {new Date(e.ts).toLocaleTimeString()}
          </span>
        </div>
      ))}
      {events.length === 0 && (
        <p className="text-sm text-muted-foreground">No messages yet</p>
      )}
    </div>
  );
}
