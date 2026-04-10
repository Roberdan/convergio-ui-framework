// Curated examples — Part C (strategy, network, forms, nav, layout, theme)
export const CURATED_EXAMPLES_C: Record<string, string> = {
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
