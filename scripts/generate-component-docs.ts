#!/usr/bin/env npx tsx
/**
 * Generate .mdx documentation files for all Maranello components.
 *
 * Reads:
 *   - src/lib/component-catalog-data.ts   (catalog metadata)
 *   - src/components/maranello/<filePath>  (props interface)
 *
 * Writes:
 *   - docs/components/<category>/<slug>.mdx
 *
 * Usage:  npx tsx scripts/generate-component-docs.ts [--force]
 *
 * By default, preserves manually edited files (those with inline code examples
 * containing more than a single JSX tag). Pass --force to overwrite all.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ── paths ──────────────────────────────────────────────────────────
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const CATALOG_PATH = path.join(ROOT, "src/lib/component-catalog-data.ts");
const COMPONENTS_DIR = path.join(ROOT, "src/components/maranello");
const DOCS_DIR = path.join(ROOT, "docs/components");
const FORCE = process.argv.includes("--force");

// ── types ──────────────────────────────────────────────────────────
interface CatalogEntry {
  name: string;
  slug: string;
  category: string;
  description: string;
  keywords: string[];
  whenToUse: string;
  filePath: string;
  propsInterface: string;
}

// ── parse catalog ──────────────────────────────────────────────────
function parseCatalog(): CatalogEntry[] {
  const src = fs.readFileSync(CATALOG_PATH, "utf-8");
  const entries: CatalogEntry[] = [];

  const cCallRe =
    /c\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*\n?\s*"([^"]+)"\s*,\s*\n?\s*"([^"]+)"\s*,\s*\n?\s*\[([^\]]+)\]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = cCallRe.exec(src)) !== null) {
    const [, name, slug, category, description, whenToUse, kwRaw] = m;
    const keywords = kwRaw
      .split(",")
      .map((k) => k.trim().replace(/^"|"$/g, ""));
    entries.push({
      name, slug, category, description, keywords, whenToUse,
      filePath: `${category}/${slug}.tsx`,
      propsInterface: `${name}Props`,
    });
  }

  const litRe =
    /\{\s*name:\s*"([^"]+)"\s*,\s*slug:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*\n?\s*description:\s*"([^"]+)"\s*,\s*\n?\s*whenToUse:\s*"([^"]+)"\s*,\s*\n?\s*filePath:\s*"([^"]+)"\s*,\s*propsInterface:\s*"([^"]+)"\s*,\s*\n?\s*keywords:\s*\[([^\]]+)\]\s*\}/g;
  while ((m = litRe.exec(src)) !== null) {
    const [, name, slug, category, description, whenToUse, filePath, propsInterface, kwRaw] = m;
    const keywords = kwRaw
      .split(",")
      .map((k) => k.trim().replace(/^"|"$/g, ""));
    entries.push({
      name, slug, category, description, keywords, whenToUse,
      filePath, propsInterface,
    });
  }

  return entries;
}

// ── extract props from source ──────────────────────────────────────
interface PropInfo {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  defaultValue: string;
}

function extractProps(sourceFile: string, propsInterface: string): PropInfo[] {
  if (!fs.existsSync(sourceFile)) return [];
  const src = fs.readFileSync(sourceFile, "utf-8");

  // Also read .helpers.ts for type definitions
  const helpersFile = sourceFile.replace(/\.tsx$/, ".helpers.ts");
  const helpersSrc = fs.existsSync(helpersFile) ? fs.readFileSync(helpersFile, "utf-8") : "";
  const allSrc = src + "\n" + helpersSrc;

  // Find props interface/type
  const ifaceRe = new RegExp(
    `(?:export\\s+)?(?:interface|type)\\s+${escapeRe(propsInterface)}[^{]*\\{`,
    "s"
  );
  const ifaceStart = ifaceRe.exec(src);
  if (!ifaceStart) return [];

  // Extract balanced braces
  const startIdx = ifaceStart.index + ifaceStart[0].length;
  let depth = 1;
  let endIdx = startIdx;
  for (let i = startIdx; i < src.length && depth > 0; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}") depth--;
    endIdx = i;
  }
  const body = src.slice(startIdx, endIdx);
  const props: PropInfo[] = [];

  // Parse props with JSDoc support
  // First, normalize: split lines with multiple props (separated by ;)
  const rawLines = body.split("\n");
  const lines: string[] = [];
  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    // Split on ; but only if followed by a prop declaration (word + optional ? + :)
    const parts = trimmed.split(/;\s*(?=\w+\??\s*:)/);
    for (const part of parts) {
      const p = part.trim();
      if (p) lines.push(p);
    }
  }
  let pendingDoc = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { pendingDoc = ""; continue; }

    // Collect JSDoc: /** ... */
    const jsdocInline = /\/\*\*\s*(.+?)\s*\*\//.exec(trimmed);
    if (jsdocInline && !trimmed.match(/^\w/)) {
      pendingDoc = jsdocInline[1];
      continue;
    }

    // Skip pure comment lines
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      const cmt = trimmed.replace(/^\/\*\*?\s*|\*\/\s*$|\*\s*/g, "").trim();
      if (cmt) pendingDoc = cmt;
      continue;
    }

    // Match prop line
    const propRe = /^(\w+)(\?)?:\s*(.+?)(?:;?\s*(?:\/\/\s*(.+))?$)/;
    const pm = propRe.exec(trimmed);
    if (!pm) { pendingDoc = ""; continue; }

    const [, propName, optMark, rawType, inlineComment] = pm;
    const optional = !!optMark;
    const type = rawType.replace(/\/\/.*$/, "").replace(/;$/, "").trim();

    // Description priority: JSDoc > inline comment > auto-generate
    let description = pendingDoc || inlineComment?.trim() || "";
    if (!description) {
      description = inferPropDescription(propName, type, optional);
    }

    // Try to find default value from destructuring
    const defaultValue = findDefault(src, propName, optional);

    props.push({ name: propName, type, optional, description, defaultValue });
    pendingDoc = "";
  }

  return props;
}

function findDefault(src: string, propName: string, optional: boolean): string {
  if (!optional) return "**required**";
  // Match: propName = value in destructuring
  const re = new RegExp(`${propName}\\s*=\\s*([^,}\\n]+)`);
  const m = re.exec(src);
  if (m) {
    let val = m[1].trim();
    if (val.endsWith(",")) val = val.slice(0, -1).trim();
    if (val.length > 40) return "\u2014"; // too complex
    return `\`${val}\``;
  }
  return "\u2014";
}

function inferPropDescription(name: string, type: string, optional: boolean): string {
  const map: Record<string, string> = {
    className: "Additional CSS classes",
    children: "Child elements",
    ariaLabel: "Accessible label for screen readers",
    "aria-label": "Accessible label for screen readers",
    onClick: "Click event handler",
    onChange: "Change event handler",
    onOpenChange: "Callback when open state changes",
    open: "Whether the component is open/visible",
    loading: "Show loading state",
    disabled: "Disable the component",
    animate: "Enable entry animation",
    showLegend: "Display the legend",
    editable: "Enable inline editing",
    title: "Title text",
    label: "Display label",
    value: "Current value",
    min: "Minimum value",
    max: "Maximum value",
    unit: "Unit suffix (e.g. \"%\", \"$\", \"km/h\")",
    size: "Size variant",
    variant: "Visual variant",
    tone: "Color tone variant",
    compact: "Use compact/dense layout",
    placeholder: "Placeholder text",
    searchable: "Enable search/filter",
    selectable: "Enable row selection",
    sortable: "Enable column sorting",
    refreshInterval: "Auto-refresh interval in milliseconds (0 = disabled)",
    maxVisible: "Maximum number of visible items",
    currency: "Currency symbol or code",
    height: "Component height in pixels",
    showValues: "Display numeric values on items",
    showGrid: "Display grid lines",
    stacked: "Use stacked layout",
    orientation: "Layout orientation",
    defaultOpen: "Whether initially open/expanded",
    collapsible: "Enable collapse/expand behavior",
  };
  if (map[name]) return map[name];

  // Pattern-based inference
  if (name.startsWith("on") && name.length > 2) return `Callback when ${name.slice(2).replace(/([A-Z])/g, " $1").toLowerCase().trim()}`;
  if (name.startsWith("show")) return `Whether to show ${name.slice(4).replace(/([A-Z])/g, " $1").toLowerCase().trim()}`;
  if (name.startsWith("enable")) return `Enable ${name.slice(6).replace(/([A-Z])/g, " $1").toLowerCase().trim()}`;
  if (name.startsWith("default")) return `Default value for ${name.slice(7).replace(/([A-Z])/g, " $1").toLowerCase().trim()}`;

  // Type-based
  if (type.includes("[]") || type.includes("Array")) return `Array of ${name}`;
  if (type === "boolean") return optional ? `Enable ${name.replace(/([A-Z])/g, " $1").toLowerCase().trim()}` : `Whether ${name.replace(/([A-Z])/g, " $1").toLowerCase().trim()} is active`;
  if (type === "string") return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")} text`;
  if (type === "number") return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")} value`;

  return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")}`;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── curated example data ───────────────────────────────────────────
// For components with complex required props, provide realistic sample data.
const CURATED_EXAMPLES: Record<string, string> = {
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
  "mn-porter-five-forces": `import { MnPorterFiveForces } from "@/components/maranello"

<MnPorterFiveForces
  forces={[
    { label: "Supplier Power", value: 3, description: "Few alternative suppliers" },
    { label: "Buyer Power", value: 4, description: "High price sensitivity" },
    { label: "Competitive Rivalry", value: 5, description: "Intense competition" },
    { label: "Threat of Substitution", value: 2, description: "Few direct substitutes" },
    { label: "Threat of New Entry", value: 3, description: "Moderate barriers" },
  ]}
/>`,
  "mn-customer-journey": `import { MnCustomerJourney } from "@/components/maranello"

<MnCustomerJourney
  phases={[
    { label: "Awareness", touchpoints: ["Social media", "Blog post"], sentiment: "neutral" },
    { label: "Consideration", touchpoints: ["Demo", "Pricing page"], sentiment: "positive" },
    { label: "Purchase", touchpoints: ["Checkout", "Onboarding"], sentiment: "positive" },
    { label: "Retention", touchpoints: ["Support", "Newsletter"], sentiment: "neutral" },
  ]}
/>`,
  "mn-customer-journey-map": `import { MnCustomerJourneyMap } from "@/components/maranello"

<MnCustomerJourneyMap
  stages={[
    { label: "Discovery", emotion: 3, actions: ["Searches online", "Reads reviews"], painPoints: ["Hard to compare"] },
    { label: "Evaluation", emotion: 4, actions: ["Requests demo", "Talks to sales"], painPoints: ["Pricing unclear"] },
    { label: "Purchase", emotion: 5, actions: ["Signs contract"], painPoints: [] },
  ]}
/>`,
  "mn-business-model-canvas": `import { MnBusinessModelCanvas } from "@/components/maranello"

<MnBusinessModelCanvas editable />`,
  "mn-strategy-canvas": `import { MnStrategyCanvas } from "@/components/maranello"

<MnStrategyCanvas
  segments={[
    { label: "Value Proposition", items: ["AI-powered automation", "Real-time analytics"] },
    { label: "Key Activities", items: ["Platform development", "Customer success"] },
    { label: "Revenue Streams", items: ["SaaS subscriptions", "Enterprise licenses"] },
  ]}
/>`,
  "mn-mesh-network": `import { MnMeshNetwork } from "@/components/maranello"

<MnMeshNetwork
  nodes={[
    { id: "n1", label: "API Gateway", status: "online", x: 100, y: 100 },
    { id: "n2", label: "Auth Service", status: "online", x: 300, y: 50 },
    { id: "n3", label: "DB Primary", status: "online", x: 300, y: 200 },
    { id: "n4", label: "Cache", status: "degraded", x: 500, y: 100 },
  ]}
  edges={[
    { from: "n1", to: "n2" },
    { from: "n1", to: "n3" },
    { from: "n2", to: "n4" },
  ]}
/>`,
  "mn-system-status": `import { MnSystemStatus } from "@/components/maranello"

<MnSystemStatus
  services={[
    { id: "api", name: "API Gateway", status: "operational", uptime: 99.98, latencyMs: 42 },
    { id: "db", name: "Database", status: "operational", uptime: 99.95, latencyMs: 8 },
    { id: "queue", name: "Task Queue", status: "degraded", uptime: 98.7, latencyMs: 230 },
  ]}
/>`,
  "mn-org-chart": `import { MnOrgChart } from "@/components/maranello"

<MnOrgChart
  tree={{
    id: "ceo", label: "CEO", children: [
      { id: "cto", label: "CTO", children: [
        { id: "eng1", label: "Eng Lead" },
        { id: "eng2", label: "Infra Lead" },
      ]},
      { id: "cfo", label: "CFO" },
    ],
  }}
/>`,
  "mn-deployment-table": `import { MnDeploymentTable } from "@/components/maranello"

<MnDeploymentTable
  deployments={[
    { id: "d1", service: "api-gateway", version: "2.4.1", environment: "production", status: "success", timestamp: "2025-01-15T10:30:00Z" },
    { id: "d2", service: "auth-service", version: "1.8.0", environment: "staging", status: "in_progress", timestamp: "2025-01-15T11:00:00Z" },
  ]}
/>`,
  "mn-social-graph": `import { MnSocialGraph } from "@/components/maranello"

<MnSocialGraph
  nodes={[
    { id: "1", label: "Alice", group: "engineering" },
    { id: "2", label: "Bob", group: "design" },
    { id: "3", label: "Carol", group: "engineering" },
  ]}
  edges={[
    { from: "1", to: "2", weight: 5 },
    { from: "1", to: "3", weight: 8 },
    { from: "2", to: "3", weight: 3 },
  ]}
/>`,
  "mn-network-messages": `import { MnNetworkMessages } from "@/components/maranello"

<MnNetworkMessages
  nodes={[
    { id: "a", label: "Client", x: 50, y: 150 },
    { id: "b", label: "Server", x: 250, y: 150 },
    { id: "c", label: "Database", x: 450, y: 150 },
  ]}
  connections={[
    { from: "a", to: "b", label: "HTTP" },
    { from: "b", to: "c", label: "SQL" },
  ]}
/>`,
  "mn-login": `import { MnLogin } from "@/components/maranello"

<MnLogin
  onSubmit={(email, password) => handleLogin(email, password)}
  submitLabel="Sign in"
/>`,
  "mn-toggle-switch": `import { MnToggleSwitch } from "@/components/maranello"

const [enabled, setEnabled] = useState(false)

<MnToggleSwitch
  checked={enabled}
  onCheckedChange={setEnabled}
  label="Enable notifications"
  size="md"
/>`,
  "mn-filter-panel": `import { MnFilterPanel } from "@/components/maranello"

<MnFilterPanel
  sections={[
    { label: "Status", type: "checkbox", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] },
    { label: "Role", type: "select", options: [{ label: "Admin", value: "admin" }, { label: "User", value: "user" }] },
  ]}
  onApply={(filters) => console.log(filters)}
/>`,
  "mn-breadcrumb": `import { MnBreadcrumb } from "@/components/maranello"

<MnBreadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Showcase", href: "/showcase" },
    { label: "Data Viz" },
  ]}
/>`,
  "mn-stepper": `import { MnStepper } from "@/components/maranello"

<MnStepper
  steps={[
    { label: "Account" },
    { label: "Profile" },
    { label: "Review" },
    { label: "Confirm" },
  ]}
  currentStep={1}
/>`,
  "mn-section-nav": `import { MnSectionNav } from "@/components/maranello"

<MnSectionNav
  items={[
    { id: "overview", label: "Overview" },
    { id: "details", label: "Details" },
    { id: "settings", label: "Settings" },
  ]}
  current="overview"
/>`,
  "mn-section-card": `import { MnSectionCard } from "@/components/maranello"

<MnSectionCard title="Configuration" collapsible defaultOpen>
  <p>Card content goes here.</p>
</MnSectionCard>`,
  "mn-admin-shell": `import { MnAdminShell } from "@/components/maranello"

<MnAdminShell
  nav={[
    { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { label: "Users", href: "/users", icon: "Users" },
    { label: "Settings", href: "/settings", icon: "Settings" },
  ]}
>
  <main>{children}</main>
</MnAdminShell>`,
  "mn-detail-panel": `import { MnDetailPanel } from "@/components/maranello"

<MnDetailPanel
  open={open}
  onOpenChange={setOpen}
  title="User Details"
  sections={[
    { label: "Info", fields: [{ label: "Name", value: "Alice" }, { label: "Email", value: "alice@example.com" }] },
    { label: "Activity", fields: [{ label: "Last login", value: "2 hours ago" }] },
  ]}
/>`,
  "mn-dropdown-menu": `import { MnDropdownMenu } from "@/components/maranello"

<MnDropdownMenu
  trigger={<button>Options</button>}
  items={[
    { label: "Edit", onClick: () => edit() },
    { label: "Duplicate", onClick: () => duplicate() },
    { label: "Delete", onClick: () => remove(), variant: "destructive" },
  ]}
/>`,
  "mn-theme-toggle": `import { MnThemeToggle } from "@/components/maranello"

<MnThemeToggle showLabel />`,
  "mn-theme-rotary": `import { MnThemeRotary } from "@/components/maranello"

<MnThemeRotary />`,
  "mn-manettino": `import { MnManettino } from "@/components/maranello"

<MnManettino />`,
  "mn-a11y-fab": `import { MnA11yFab } from "@/components/maranello"

{/* Add once in your root layout */}
<MnA11yFab />`,
  "mn-a11y": `import { MnA11y } from "@/components/maranello"

<MnA11y />`,
  "mn-map": `import { MnMap } from "@/components/maranello"

<MnMap
  markers={[
    { lat: 44.53, lng: 10.86, label: "Maranello" },
    { lat: 45.46, lng: 9.19, label: "Milan" },
  ]}
  enableZoom
  enablePan
/>`,
};

// ── accessibility notes ────────────────────────────────────────────
function a11yNotes(entry: CatalogEntry): string {
  const notes: string[] = [];
  const cat = entry.category;
  const slug = entry.slug;

  if (cat === "forms") {
    notes.push("- Form controls are associated with labels via `htmlFor`/`id`");
    notes.push("- Validation errors are announced to screen readers");
    notes.push("- Supports keyboard navigation between fields");
  } else if (cat === "navigation") {
    notes.push("- Implements `aria-current` for active navigation items");
    notes.push("- Full keyboard navigation support with arrow keys");
  } else if (cat === "feedback") {
    notes.push("- Uses `role=\"alert\"` or `aria-live` regions for dynamic content");
    notes.push("- Focus is managed when content appears/disappears");
  } else if (cat === "data-display") {
    notes.push("- Color is not the only indicator \u2014 text or icons provide meaning");
    notes.push("- Interactive elements are keyboard accessible");
  } else if (cat === "data-viz") {
    notes.push("- Charts include `aria-label` describing the data trend");
    notes.push("- Color is supplemented with labels for color-blind users");
  } else if (cat === "layout") {
    notes.push("- Uses semantic landmarks (`<main>`, `<nav>`, `<aside>`)");
    notes.push("- Skip-to-content link is supported");
  } else if (cat === "network") {
    notes.push("- Interactive nodes are keyboard focusable");
    notes.push("- Status information uses `aria-live` for updates");
  } else if (cat === "ops") {
    notes.push("- Data tables include proper `<th>` scope attributes");
    notes.push("- Drag-and-drop has keyboard alternatives");
  } else if (cat === "strategy") {
    notes.push("- Matrix cells are keyboard navigable");
    notes.push("- Visual data is supplemented with text descriptions");
  } else if (cat === "theme") {
    notes.push("- Theme changes are announced via `aria-live`");
    notes.push("- All controls meet WCAG 2.2 AA contrast requirements");
  } else if (cat === "financial") {
    notes.push("- Monetary values use `aria-label` for screen reader clarity");
    notes.push("- Tables include proper header associations");
  } else if (cat === "agentic") {
    notes.push("- Status updates use `aria-live` for real-time announcements");
    notes.push("- Interactive elements support keyboard activation");
  }

  if (slug.includes("modal") || slug.includes("dialog")) {
    notes.push("- Focus is trapped inside the modal while open");
    notes.push("- Escape key closes the modal");
  }
  if (slug.includes("tab")) {
    notes.push("- Follows WAI-ARIA Tabs pattern (`role=\"tablist\"` / `role=\"tab\"`)");
  }
  if (slug.includes("toggle") || slug.includes("switch")) {
    notes.push("- Uses `role=\"switch\"` with `aria-checked` state");
  }

  return notes.join("\n");
}

// ── generate example code ──────────────────────────────────────────
function generateExample(entry: CatalogEntry, props: PropInfo[]): string {
  // Use curated example if available
  if (CURATED_EXAMPLES[entry.slug]) {
    return CURATED_EXAMPLES[entry.slug];
  }

  // Auto-generate a reasonable example
  const { name } = entry;
  const required = props.filter((p) => !p.optional && p.name !== "className");
  const propsStr: string[] = [];

  for (const p of required) {
    if (p.type.includes("[]")) propsStr.push(`${p.name}={[]}`);
    else if (p.type === "string") propsStr.push(`${p.name}="Example"`);
    else if (p.type === "number") propsStr.push(`${p.name}={0}`);
    else if (p.type === "boolean") propsStr.push(`${p.name}`);
    else if (p.type.startsWith("(")) propsStr.push(`${p.name}={() => {}}`);
    else propsStr.push(`${p.name}={/* ${p.type} */}`);
  }

  // Add a couple optional flavor props
  const sizeProp = props.find((p) => p.name === "size" && p.optional);
  if (sizeProp) propsStr.push(`size="md"`);
  const animProp = props.find((p) => p.name === "animate" && p.optional);
  if (animProp) propsStr.push(`animate`);

  const ps = propsStr.length > 0 ? "\n  " + propsStr.join("\n  ") + "\n" : " ";

  return `import { ${name} } from "@/components/maranello"\n\n<${name}${ps}/>`;
}

// ── format props table ─────────────────────────────────────────────
function propsTable(props: PropInfo[]): string {
  if (props.length === 0)
    return "_This component extends native HTML attributes. See source for full type details._\n";

  const lines: string[] = [
    "| Prop | Type | Default | Description |",
    "|------|------|---------|-------------|",
  ];

  for (const p of props) {
    const escapedType = p.type
      .replace(/\|/g, "\\|")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    lines.push(`| \`${p.name}\` | \`${escapedType}\` | ${p.defaultValue} | ${p.description} |`);
  }

  return lines.join("\n");
}

// ── generate .mdx content ──────────────────────────────────────────
function generateMdx(entry: CatalogEntry, props: PropInfo[]): string {
  const kw = entry.keywords.map((k) => `"${k}"`).join(", ");

  return `---
title: ${entry.name}
category: ${entry.category}
description: "${entry.description}"
keywords: [${kw}]
---

# ${entry.name}

${entry.description}.

## When to use

${entry.whenToUse}.

## Props

${propsTable(props)}

## Example

\`\`\`tsx
${generateExample(entry, props)}
\`\`\`

## Accessibility

${a11yNotes(entry)}
`;
}

// ── check if a file was manually edited ────────────────────────────
function isManuallyEdited(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, "utf-8");
  // Manually edited files have multi-line examples, type annotations, etc.
  const codeBlocks = content.match(/```tsx[\s\S]*?```/g) || [];
  for (const block of codeBlocks) {
    const lines = block.split("\n").filter((l) => l.trim() && !l.startsWith("```"));
    if (lines.length > 5) return true; // More than 5 lines of code = manually edited
  }
  return false;
}

// ── main ───────────────────────────────────────────────────────────
function main() {
  const entries = parseCatalog();
  console.log(`Parsed ${entries.length} catalog entries`);

  let generated = 0;
  let skipped = 0;
  let preserved = 0;

  for (const entry of entries) {
    const outDir = path.join(DOCS_DIR, entry.category);
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${entry.slug}.mdx`);

    // Preserve manually edited files unless --force
    if (!FORCE && isManuallyEdited(outFile)) {
      console.log(`  ✓  Preserved (manually edited): ${entry.slug}.mdx`);
      preserved++;
      continue;
    }

    const sourceFile = path.join(COMPONENTS_DIR, entry.filePath);
    const props = extractProps(sourceFile, entry.propsInterface);

    if (!fs.existsSync(sourceFile)) {
      console.warn(`  ⚠  Source not found: ${entry.filePath}`);
      skipped++;
    }

    const mdx = generateMdx(entry, props);
    fs.writeFileSync(outFile, mdx, "utf-8");
    generated++;
  }

  console.log(`\n✅ Generated ${generated} .mdx files`);
  if (preserved > 0) console.log(`✓  Preserved ${preserved} manually edited files`);
  if (skipped > 0) console.log(`⚠  ${skipped} source files not found`);

  const count = fs
    .readdirSync(DOCS_DIR, { recursive: true })
    .filter((f) => String(f).endsWith(".mdx")).length;
  console.log(`📁 Total .mdx files in docs/components: ${count}`);
}

main();
