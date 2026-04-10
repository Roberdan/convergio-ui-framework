// Curated examples — Part A (agentic, data-display, data-viz)
export const CURATED_EXAMPLES_A: Record<string, string> = {
  "mn-active-missions": `import { MnActiveMissions } from "@/components/maranello"

<MnActiveMissions
  missions={[
    { id: "m1", name: "Data Pipeline Sync", agent: "worker-01", status: "running", progress: 72 },
    { id: "m2", name: "Report Generation", agent: "worker-02", status: "completed", progress: 100 },
    { id: "m3", name: "Model Training", agent: "worker-03", status: "queued", progress: 0 },
  ]}
/>`,
  "mn-agent-trace": `import { MnAgentTrace } from "@/components/maranello"

<MnAgentTrace
  steps={[
    { id: "s1", type: "thought", content: "The user wants deployment status", timestamp: "10:32:01" },
    { id: "s2", type: "action", content: "Querying deployment API...", timestamp: "10:32:02" },
    { id: "s3", type: "observation", content: "3 services running, 1 degraded", timestamp: "10:32:03" },
    { id: "s4", type: "response", content: "All services operational except Task Queue", timestamp: "10:32:04" },
  ]}
/>`,
  "mn-approval-chain": `import { MnApprovalChain } from "@/components/maranello"

<MnApprovalChain
  steps={[
    { id: "a1", label: "Engineering", approver: "Alice", status: "approved", timestamp: "2025-01-10" },
    { id: "a2", label: "Security", approver: "Bob", status: "approved", timestamp: "2025-01-11" },
    { id: "a3", label: "Legal", approver: "Carol", status: "pending" },
    { id: "a4", label: "Executive", approver: "Dave", status: "waiting" },
  ]}
/>`,
  "mn-augmented-brain": `import { MnAugmentedBrain } from "@/components/maranello"

<MnAugmentedBrain
  nodes={[
    { id: "n1", label: "Planning", value: 0.8 },
    { id: "n2", label: "Reasoning", value: 0.6 },
    { id: "n3", label: "Memory", value: 0.9 },
  ]}
  connections={[
    { from: "n1", to: "n2", strength: 0.7 },
    { from: "n2", to: "n3", strength: 0.5 },
  ]}
  height={400}
/>`,
  "mn-hub-spoke": `import { MnHubSpoke } from "@/components/maranello"

<MnHubSpoke
  hub={{ id: "orchestrator", label: "Orchestrator", status: "active" }}
  spokes={[
    { id: "s1", label: "Worker 1", status: "active", load: 72 },
    { id: "s2", label: "Worker 2", status: "active", load: 45 },
    { id: "s3", label: "Worker 3", status: "idle", load: 0 },
    { id: "s4", label: "Worker 4", status: "error", load: 0 },
  ]}
/>`,
  "mn-neural-nodes": `import { MnNeuralNodes } from "@/components/maranello"

<MnNeuralNodes nodeCount={40} connectionDensity={0.2} interactive />`,
  "mn-data-table": `import { MnDataTable } from "@/components/maranello"

<MnDataTable
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "tasks", label: "Tasks", align: "right" },
  ]}
  data={[
    { name: "Alice", role: "Engineer", status: "Active", tasks: 12 },
    { name: "Bob", role: "Designer", status: "Active", tasks: 8 },
    { name: "Carol", role: "PM", status: "Away", tasks: 5 },
  ]}
  pageSize={10}
/>`,
  "mn-badge": `import { MnBadge } from "@/components/maranello"

<MnBadge tone="success">Active</MnBadge>
<MnBadge tone="warning">Pending</MnBadge>
<MnBadge tone="danger">Failed</MnBadge>
<MnBadge tone="neutral">Draft</MnBadge>`,
  "mn-kpi-scorecard": `import { MnKpiScorecard } from "@/components/maranello"

<MnKpiScorecard
  rows={[
    { label: "Revenue", actual: 125000, target: 150000, unit: "$" },
    { label: "Users", actual: 4200, target: 5000 },
    { label: "Uptime", actual: 99.9, target: 99.5, unit: "%" },
  ]}
  currency="$"
/>`,
  "mn-flip-counter": `import { MnFlipCounter } from "@/components/maranello"

<MnFlipCounter value={1234} digits={6} size="lg" />`,
  "mn-progress-ring": `import { MnProgressRing } from "@/components/maranello"

<MnProgressRing value={73} max={100} size="md" variant="primary" />`,
  "mn-source-cards": `import { MnSourceCards } from "@/components/maranello"

<MnSourceCards
  cards={[
    { title: "API Documentation", url: "https://docs.example.com", snippet: "REST endpoints for user management..." },
    { title: "Architecture Guide", url: "https://wiki.example.com", snippet: "Microservice communication patterns..." },
  ]}
  layout="grid"
/>`,
  "mn-token-meter": `import { MnTokenMeter } from "@/components/maranello"

<MnTokenMeter
  label="GPT-4o Usage"
  prompt={1200}
  completion={3400}
  limit={8192}
  showBreakdown
/>`,
  "mn-user-table": `import { MnUserTable } from "@/components/maranello"

<MnUserTable
  users={[
    { id: "1", name: "Alice Smith", email: "alice@example.com", role: "Admin", status: "active" },
    { id: "2", name: "Bob Jones", email: "bob@example.com", role: "Editor", status: "active" },
    { id: "3", name: "Carol White", email: "carol@example.com", role: "Viewer", status: "inactive" },
  ]}
  searchable
  selectable
/>`,
  "mn-gauge": `import { MnGauge } from "@/components/maranello"

<MnGauge value={73} min={0} max={100} unit="%" animate />`,
  "mn-half-gauge": `import { MnHalfGauge } from "@/components/maranello"

<MnHalfGauge value={65} min={0} max={100} size="md" animate />`,
  "mn-speedometer": `import { MnSpeedometer } from "@/components/maranello"

<MnSpeedometer value={180} min={0} max={320} unit="km/h" animate />`,
  "mn-funnel": `import { MnFunnel } from "@/components/maranello"

<MnFunnel
  data={{
    pipeline: [
      { label: "Visitors", count: 10000 },
      { label: "Leads", count: 3200 },
      { label: "Qualified", count: 1100 },
      { label: "Proposals", count: 450 },
      { label: "Closed", count: 120 },
    ],
    total: 10000,
  }}
  animate
  size="md"
/>`,
  "mn-heatmap": `import { MnHeatmap } from "@/components/maranello"

<MnHeatmap
  data={[
    [{ label: "Mon", value: 3 }, { label: "Tue", value: 7 }, { label: "Wed", value: 2 }],
    [{ label: "Mon", value: 5 }, { label: "Tue", value: 1 }, { label: "Wed", value: 9 }],
  ]}
  showValues
/>`,
  "mn-waterfall": `import { MnWaterfall } from "@/components/maranello"

<MnWaterfall
  steps={[
    { label: "Revenue", value: 50000 },
    { label: "COGS", value: -18000 },
    { label: "OpEx", value: -12000 },
    { label: "Tax", value: -5000 },
    { label: "Net Profit", value: 15000, isTotal: true },
  ]}
/>`,
  "mn-hbar": `import { MnHbar } from "@/components/maranello"

<MnHbar
  bars={[
    { label: "Chrome", value: 65 },
    { label: "Safari", value: 18 },
    { label: "Firefox", value: 10 },
    { label: "Edge", value: 7 },
  ]}
  unit="%"
  showValues
/>`,
  "mn-bullet-chart": `import { MnBulletChart } from "@/components/maranello"

<MnBulletChart
  value={280}
  target={300}
  max={400}
  label="Revenue ($K)"
  animate
/>`,
  "mn-confidence-chart": `import { MnConfidenceChart } from "@/components/maranello"

<MnConfidenceChart
  labels={["Jan", "Feb", "Mar", "Apr", "May"]}
  values={[42, 55, 48, 62, 70]}
  lower={[35, 45, 38, 50, 58]}
  upper={[50, 65, 58, 74, 82]}
  unit="%"
/>`,
  "mn-cost-timeline": `import { MnCostTimeline } from "@/components/maranello"

<MnCostTimeline
  labels={["Jan", "Feb", "Mar", "Apr"]}
  series={[
    { label: "Compute", data: [1200, 1400, 1100, 1600], color: "var(--chart-1)" },
    { label: "Storage", data: [300, 350, 320, 400], color: "var(--chart-2)" },
  ]}
  unit="$"
  stacked
/>`,
  "mn-cohort-grid": `import { MnCohortGrid } from "@/components/maranello"

<MnCohortGrid
  rows={[
    { label: "Jan 2025", values: [100, 85, 72, 68, 61] },
    { label: "Feb 2025", values: [120, 98, 80, 74] },
    { label: "Mar 2025", values: [95, 82, 70] },
  ]}
/>`,
  "mn-budget-treemap": `import { MnBudgetTreemap } from "@/components/maranello"

<MnBudgetTreemap
  items={[
    { label: "Engineering", value: 450000, color: "var(--chart-1)" },
    { label: "Marketing", value: 280000, color: "var(--chart-2)" },
    { label: "Sales", value: 320000, color: "var(--chart-3)" },
    { label: "Operations", value: 150000, color: "var(--chart-4)" },
  ]}
/>`,
  "mn-pipeline-ranking": `import { MnPipelineRanking } from "@/components/maranello"

<MnPipelineRanking
  stages={[
    { label: "Discovery", count: 42, value: 1200000 },
    { label: "Proposal", count: 18, value: 850000 },
    { label: "Negotiation", count: 8, value: 520000 },
    { label: "Closed Won", count: 3, value: 180000 },
  ]}
/>`,
};
