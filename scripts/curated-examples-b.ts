// Curated examples — Part B (feedback, financial, ops)
export const CURATED_EXAMPLES_B: Record<string, string> = {
  "mn-activity-feed": `import { MnActivityFeed } from "@/components/maranello"

<MnActivityFeed
  items={[
    { id: "1", time: "2m ago", text: "Deployment completed successfully", status: "success" },
    { id: "2", time: "8m ago", text: "New PR opened: feature/auth-refactor", status: "info" },
    { id: "3", time: "1h ago", text: "Build failed on staging", status: "error" },
  ]}
/>`,
  "mn-modal": `import { MnModal } from "@/components/maranello"

const [open, setOpen] = useState(false)

<MnModal open={open} onOpenChange={setOpen} title="Confirm Action">
  <p>Are you sure you want to proceed?</p>
</MnModal>`,
  "mn-notification-center": `import { MnNotificationCenter } from "@/components/maranello"

<MnNotificationCenter
  open={open}
  onOpenChange={setOpen}
  notifications={[
    { id: "1", title: "Deploy complete", message: "v2.4.1 is live", time: "5m ago", read: false },
    { id: "2", title: "Review requested", message: "PR #42 needs your review", time: "1h ago", read: true },
  ]}
/>`,
  "mn-state-scaffold": `import { MnStateScaffold } from "@/components/maranello"

{/* Loading state */}
<MnStateScaffold state="loading" />

{/* Empty state */}
<MnStateScaffold state="empty" title="No data" description="Add items to get started" />

{/* Error state */}
<MnStateScaffold state="error" title="Something went wrong" onRetry={() => refetch()} />`,
  "mn-streaming-text": `import { MnStreamingText } from "@/components/maranello"

<MnStreamingText
  text="The deployment was successful. All services are now running on v2.4.1."
  streaming={isStreaming}
  typingCursor
/>`,
  "mn-toast": `import { MnToast, toast } from "@/components/maranello"

{/* Trigger a toast */}
toast.success("Changes saved successfully")
toast.error("Failed to connect to server")
toast.info("New version available")

{/* Toast container (add once in your layout) */}
<MnToast />`,
  "mn-finops": `import { MnFinops } from "@/components/maranello"

<MnFinops
  metrics={[
    { label: "Compute", current: 12400, previous: 11800, budget: 15000, unit: "$" },
    { label: "Storage", current: 3200, previous: 2900, budget: 4000, unit: "$" },
    { label: "Network", current: 890, previous: 950, budget: 1200, unit: "$" },
  ]}
/>`,
  "mn-agent-cost-breakdown": `import { MnAgentCostBreakdown } from "@/components/maranello"

<MnAgentCostBreakdown
  rows={[
    { agent: "worker-01", model: "claude-sonnet", tokens: 124000, cost: 0.62, tasks: 14 },
    { agent: "worker-02", model: "gpt-4o", tokens: 86000, cost: 1.72, tasks: 8 },
    { agent: "worker-03", model: "claude-haiku", tokens: 210000, cost: 0.21, tasks: 42 },
  ]}
  currency="USD"
  period="Last 7 days"
  sortable
/>`,
  "mn-gantt": `import { MnGantt } from "@/components/maranello"

<MnGantt
  tasks={[
    { id: "t1", label: "Design", start: "2025-01-01", end: "2025-01-15", status: "done" },
    { id: "t2", label: "Development", start: "2025-01-10", end: "2025-02-15", status: "active", progress: 60 },
    { id: "t3", label: "Testing", start: "2025-02-10", end: "2025-02-28", status: "pending" },
  ]}
  showToday
/>`,
  "mn-kanban-board": `import { MnKanbanBoard } from "@/components/maranello"

<MnKanbanBoard
  columns={[
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ]}
  cards={[
    { id: "c1", column: "todo", title: "Update API docs", assignee: "Alice" },
    { id: "c2", column: "in-progress", title: "Fix auth bug", assignee: "Bob", priority: "high" },
    { id: "c3", column: "done", title: "Deploy v2.4", assignee: "Carol" },
  ]}
/>`,
  "mn-audit-log": `import { MnAuditLog } from "@/components/maranello"

<MnAuditLog
  entries={[
    { id: "a1", action: "user.login", actor: "alice@example.com", timestamp: "2025-01-15T10:30:00Z", details: "IP: 192.168.1.1" },
    { id: "a2", action: "plan.created", actor: "bob@example.com", timestamp: "2025-01-15T11:00:00Z", details: "Plan #1042" },
    { id: "a3", action: "deploy.started", actor: "system", timestamp: "2025-01-15T12:00:00Z", details: "v2.4.1 to production" },
  ]}
  maxVisible={50}
/>`,
  "mn-binnacle": `import { MnBinnacle } from "@/components/maranello"

<MnBinnacle
  entries={[
    { id: "e1", timestamp: "10:32:01", level: "info", message: "Service started on port 8420" },
    { id: "e2", timestamp: "10:32:05", level: "warn", message: "High memory usage detected (87%)" },
    { id: "e3", timestamp: "10:33:12", level: "error", message: "Connection to DB lost, retrying..." },
  ]}
/>`,
  "mn-night-jobs": `import { MnNightJobs } from "@/components/maranello"

<MnNightJobs
  jobs={[
    { id: "j1", name: "DB Backup", schedule: "02:00", lastRun: "2025-01-15T02:00:00Z", status: "success", duration: "4m 32s" },
    { id: "j2", name: "Report Gen", schedule: "03:00", lastRun: "2025-01-15T03:00:00Z", status: "success", duration: "12m 10s" },
    { id: "j3", name: "Cache Warm", schedule: "04:00", lastRun: "2025-01-15T04:00:00Z", status: "failed", duration: "0m 45s" },
  ]}
/>`,
  "mn-instrument-binnacle": `import { MnInstrumentBinnacle } from "@/components/maranello"

<MnInstrumentBinnacle
  entries={[
    { id: "e1", timestamp: "10:32:01", level: "info", message: "All systems nominal" },
  ]}
  metrics={[
    { label: "CPU", value: 42, unit: "%" },
    { label: "Memory", value: 6.2, unit: "GB" },
    { label: "Requests", value: 1420, unit: "/min" },
  ]}
/>`,
  "mn-entity-workbench": `import { MnEntityWorkbench } from "@/components/maranello"

<MnEntityWorkbench
  tabs={[
    { id: "users", label: "Users", count: 42 },
    { id: "teams", label: "Teams", count: 8 },
    { id: "roles", label: "Roles", count: 5 },
  ]}
  allowAdd
/>`,
  "mn-facet-workbench": `import { MnFacetWorkbench } from "@/components/maranello"

<MnFacetWorkbench
  groups={[
    { label: "Status", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] },
    { label: "Role", options: [{ label: "Admin", value: "admin" }, { label: "Editor", value: "editor" }] },
  ]}
/>`,
  "mn-bcg-matrix": `import { MnBcgMatrix } from "@/components/maranello"

<MnBcgMatrix
  items={[
    { label: "Product A", share: 0.7, growth: 15 },
    { label: "Product B", share: 0.3, growth: 20 },
    { label: "Product C", share: 0.8, growth: -5 },
    { label: "Product D", share: 0.2, growth: 2 },
  ]}
  height={400}
/>`,
  "mn-nine-box-matrix": `import { MnNineBoxMatrix } from "@/components/maranello"

<MnNineBoxMatrix
  items={[
    { label: "Alice", x: 2, y: 2 },
    { label: "Bob", x: 0, y: 1 },
    { label: "Carol", x: 1, y: 0 },
  ]}
  xLabel="Performance"
  yLabel="Potential"
/>`,
  "mn-risk-matrix": `import { MnRiskMatrix } from "@/components/maranello"

<MnRiskMatrix
  items={[
    { label: "Data breach", likelihood: 2, impact: 4 },
    { label: "Service outage", likelihood: 3, impact: 3 },
    { label: "Key person risk", likelihood: 1, impact: 2 },
  ]}
/>`,
  "mn-decision-matrix": `import { MnDecisionMatrix } from "@/components/maranello"

<MnDecisionMatrix
  criteria={[
    { label: "Cost", weight: 0.3 },
    { label: "Quality", weight: 0.4 },
    { label: "Speed", weight: 0.3 },
  ]}
  options={[
    { label: "Vendor A", scores: [8, 6, 9] },
    { label: "Vendor B", scores: [5, 9, 7] },
    { label: "Vendor C", scores: [9, 7, 5] },
  ]}
/>`,
  "mn-okr": `import { MnOkr } from "@/components/maranello"

<MnOkr
  objectives={[
    {
      title: "Improve platform reliability",
      keyResults: [
        { label: "Uptime > 99.9%", progress: 85 },
        { label: "P1 incidents < 2/month", progress: 100 },
        { label: "Deploy time < 5min", progress: 60 },
      ],
    },
  ]}
  title="Q1 2025 OKRs"
/>`,
};
