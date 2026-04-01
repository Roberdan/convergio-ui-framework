import { Badge } from "@/components/ui/badge";
import { Activity as ActivityIcon } from "lucide-react";

const EVENTS = [
  { time: "2m ago", agent: "worker-01", action: "completed task T3-04 in deployment pipeline", type: "success" },
  { time: "8m ago", agent: "system", action: "batch job sync-reports validated and queued", type: "info" },
  { time: "14m ago", agent: "worker-02", action: "workspace env-staging provisioned", type: "info" },
  { time: "22m ago", agent: "worker-03", action: "started task T4-01 in data-export job", type: "default" },
  { time: "35m ago", agent: "worker-04", action: "escalated task T2-03 to senior model", type: "warning" },
  { time: "1h ago", agent: "system", action: "build failed on feature/api-gateway-patch", type: "error" },
  { time: "1h ago", agent: "worker-01", action: "submitted PR #14 for review", type: "success" },
  { time: "2h ago", agent: "worker-05", action: "integration peer reporting-service joined", type: "info" },
];

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ActivityIcon className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1>Activity</h1>
          <p className="text-caption mt-1">Real-time event stream across all agents and plans.</p>
        </div>
      </div>

      <div className="space-y-2">
        {EVENTS.map((event, i) => (
          <div key={i} className="flex items-start gap-3 rounded-md border bg-card p-3 text-card-foreground text-sm">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              event.type === "success" ? "bg-status-success" :
              event.type === "error" ? "bg-status-error" :
              event.type === "warning" ? "bg-status-warning" : "bg-status-info"
            }`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p><Badge variant="outline" className="mr-2 font-mono text-[10px]">{event.agent}</Badge>{event.action}</p>
              <p className="text-micro mt-0.5">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
