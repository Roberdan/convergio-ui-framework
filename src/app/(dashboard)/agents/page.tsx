import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const AGENTS = [
  { id: "worker-01", status: "active", model: "claude-sonnet-4-6", tasks: 4, uptime: "2h 14m" },
  { id: "worker-02", status: "active", model: "copilot", tasks: 2, uptime: "1h 48m" },
  { id: "worker-03", status: "active", model: "claude-sonnet-4-6", tasks: 1, uptime: "45m" },
  { id: "worker-04", status: "idle", model: "copilot", tasks: 0, uptime: "3h 02m" },
  { id: "worker-05", status: "active", model: "claude-haiku-4-5", tasks: 3, uptime: "58m" },
  { id: "worker-06", status: "error", model: "copilot", tasks: 0, uptime: "12m" },
  { id: "worker-07", status: "idle", model: "claude-sonnet-4-6", tasks: 0, uptime: "4h 30m" },
  { id: "worker-08", status: "active", model: "copilot", tasks: 5, uptime: "2h 01m" },
];

const STATUS_COLOR: Record<string, string> = {
  active: "bg-status-success",
  idle: "bg-status-warning",
  error: "bg-status-error",
};

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1>Agents</h1>
          <p className="text-caption mt-1">Active workers across the mesh.</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th scope="col" className="p-3 font-medium">Agent</th>
              <th scope="col" className="p-3 font-medium">Status</th>
              <th scope="col" className="p-3 font-medium">Model</th>
              <th scope="col" className="p-3 font-medium text-right">Tasks</th>
              <th scope="col" className="p-3 font-medium text-right">Uptime</th>
            </tr>
          </thead>
          <tbody>
            {AGENTS.map((agent) => (
              <tr key={agent.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-3 font-mono">{agent.id}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLOR[agent.status]}`} aria-hidden="true" />
                    {agent.status}
                  </div>
                </td>
                <td className="p-3"><Badge variant="outline" className="font-mono text-[10px]">{agent.model}</Badge></td>
                <td className="p-3 text-right font-mono">{agent.tasks}</td>
                <td className="p-3 text-right font-mono text-muted-foreground">{agent.uptime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
