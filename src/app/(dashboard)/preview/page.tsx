"use client"

import { useState } from "react"
import {
  // W1: Simple components
  MnBadge,
  MnAvatar,
  MnAvatarGroup,
  MnBreadcrumb,
  MnFormField,
  MnFormFieldLabel,
  MnFormFieldHint,
  MnStateScaffold,
  MnToast,
  toast,
  MnTabs,
  MnTabList,
  MnTab,
  MnTabPanel,
  MnModal,
  MnCustomerJourney,
  MnDashboard,
  // W2: Shell / Navigation
  MnCommandPalette,
  MnHeaderShell,
  MnSectionNav,
  MnThemeToggle,
  MnThemeRotary,
  MnAsyncSelect,
  MnDatePicker,
  MnProfile,
  MnA11y,
  // W3: Data-heavy
  MnDataTable,
  MnDetailPanel,
  MnEntityWorkbench,
  MnFacetWorkbench,
  MnChat,
  MnOkr,
  MnSystemStatus,
  // W4: Canvas / Visual
  MnChart,
  MnGauge,
  MnSpeedometer,
  MnFunnel,
  MnHbar,
  MnGantt,
  MnKanbanBoard,
  MnMap,
  MnManettino,
  MnCruiseLever,
  MnToggleLever,
  MnSteppedRotary,
  // Types
  type ChatMessage,
  type KanbanCard,
} from "@/components/maranello"

/* ─────────────────────────────────────────────────────────────────────────────
   Shared styles
   ───────────────────────────────────────────────────────────────────────────── */

const btn =
  "px-4 py-2 rounded-md bg-[var(--mn-accent)] text-[var(--mn-accent-text)] font-medium hover:bg-[var(--mn-accent-hover)] transition-colors"

/* ─────────────────────────────────────────────────────────────────────────────
   Sample data
   ───────────────────────────────────────────────────────────────────────────── */

const sampleTableData = [
  { id: "1", name: "Ferrari SF-24", team: "Scuderia Ferrari", points: 450 },
  { id: "2", name: "Red Bull RB20", team: "Red Bull Racing", points: 520 },
  { id: "3", name: "McLaren MCL38", team: "McLaren F1", points: 380 },
  { id: "4", name: "Mercedes W15", team: "Mercedes-AMG", points: 310 },
  { id: "5", name: "Aston Martin AMR24", team: "Aston Martin", points: 260 },
]

const initialMessages: ChatMessage[] = [
  { id: "1", role: "user", content: "What's our conversion rate this week?", timestamp: new Date(Date.now() - 120000) },
  { id: "2", role: "assistant", content: "Your conversion rate is **3.2%** this week, up from 2.8% last week. The main driver was the new landing page variant B which showed a `+15%` lift in signups.", timestamp: new Date(Date.now() - 60000) },
  { id: "3", role: "user", content: "Which channel performs best?", timestamp: new Date(Date.now() - 30000) },
  { id: "4", role: "assistant", content: "Organic search leads with **42%** of total conversions, followed by direct traffic at **28%**. Social media contributes **18%** — up 3pp from last month.", timestamp: new Date() },
]

const initialKanbanCards: KanbanCard[] = [
  { id: "k1", columnId: "backlog", title: "Research competitor pricing", description: "Analyze top 5 competitors", priority: "low" },
  { id: "k2", columnId: "todo", title: "Design onboarding flow", description: "Create wireframes for new user onboarding", priority: "high", tags: ["design", "ux"] },
  { id: "k3", columnId: "doing", title: "Implement auth module", description: "JWT + OAuth2 integration", assignee: "RD", priority: "critical", tags: ["backend"] },
  { id: "k4", columnId: "doing", title: "Build dashboard widgets", description: "KPI cards and charts", assignee: "MR", priority: "medium", tags: ["frontend"] },
  { id: "k5", columnId: "done", title: "Set up CI/CD pipeline", description: "GitHub Actions + Docker", priority: "high", tags: ["devops"] },
  { id: "k6", columnId: "todo", title: "Write API documentation", description: "OpenAPI 3.1 spec for all endpoints", priority: "medium", tags: ["docs"] },
]

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */

async function searchTechnologies(query: string) {
  const techs = [
    { id: "react", label: "React" },
    { id: "vue", label: "Vue.js" },
    { id: "angular", label: "Angular" },
    { id: "svelte", label: "Svelte" },
    { id: "next", label: "Next.js" },
    { id: "nuxt", label: "Nuxt" },
    { id: "remix", label: "Remix" },
    { id: "astro", label: "Astro" },
    { id: "solid", label: "SolidJS" },
    { id: "qwik", label: "Qwik" },
  ]
  await new Promise((r) => setTimeout(r, 200))
  return techs.filter((t) => t.label.toLowerCase().includes(query.toLowerCase()))
}

function ShowcaseSection({ id, title, description, children }: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-[var(--mn-text-muted)] text-sm mt-1">{description}</p>
      </div>
      {children}
    </section>
  )
}

function ShowcaseCard({ title, children, className }: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      <h3 className="text-lg font-semibold border-b border-[var(--mn-border)] pb-2">{title}</h3>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────────────────────────── */

export default function MaranelloShowcase() {
  const [modalOpen, setModalOpen] = useState(false)
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [sectionNavCurrent, setSectionNavCurrent] = useState("overview")
  const [entityActiveTab, setEntityActiveTab] = useState("user-123")
  const [facetFilters, setFacetFilters] = useState<Record<string, string[]>>({})
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>(initialKanbanCards)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages)
  const [selectedDate, setSelectedDate] = useState("2025-01-15")

  function handleChatSend(text: string) {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMsg])
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `Thanks for asking about "${text}". This is a demo response.`,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, assistantMsg])
    }, 800)
  }

  function handleKanbanMove(cardId: string, _fromCol: string, toCol: string, position: number) {
    setKanbanCards((prev) => {
      const cards = prev.map((c) => (c.id === cardId ? { ...c, columnId: toCol } : c))
      const targetCards = cards.filter((c) => c.columnId === toCol && c.id !== cardId)
      const movedCard = cards.find((c) => c.id === cardId)!
      targetCards.splice(position, 0, movedCard)
      return cards.filter((c) => c.columnId !== toCol || c.id === cardId).concat(
        targetCards.filter((c) => c.id !== cardId)
      ).map((c) => (c.id === cardId ? { ...c, columnId: toCol } : c))
    })
  }

  return (
    <div className="min-h-screen bg-[var(--mn-surface)] text-[var(--mn-text)] p-4 lg:p-8 space-y-10 w-full">
      {/* ── Header ── */}
      <header className="space-y-2 w-full">
        <h1 className="text-3xl font-bold tracking-tight">
          🏎️ Maranello Design System — Component Showcase
        </h1>
        <p className="text-[var(--mn-text-muted)]">
          36 components across 4 waves • React / Tailwind / CVA
        </p>
        <MnBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/" },
            { label: "Component Showcase" },
          ]}
        />
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
         WAVE 1 — Simple Components
         ══════════════════════════════════════════════════════════════════════ */}
      <ShowcaseSection
        id="wave-1"
        title="Wave 1 — Simple Components"
        description="Badges, avatars, forms, modals, tabs, toast, state scaffolds, customer journey, dashboard"
      >
        {/* Badge */}
        <ShowcaseCard title="MnBadge">
          <div className="flex gap-3 flex-wrap">
            <MnBadge tone="success">Success</MnBadge>
            <MnBadge tone="warning">Warning</MnBadge>
            <MnBadge tone="danger">Danger</MnBadge>
            <MnBadge tone="info">Info</MnBadge>
            <MnBadge tone="neutral">Neutral</MnBadge>
          </div>
        </ShowcaseCard>

        {/* Avatar */}
        <ShowcaseCard title="MnAvatar + MnAvatarGroup">
          <div className="flex items-center gap-6 flex-wrap">
            <MnAvatar initials="RD" size="sm" status="online" />
            <MnAvatar initials="MR" size="md" status="busy" />
            <MnAvatar initials="LB" size="lg" status="away" />
            <MnAvatar initials="FE" size="xl" />
          </div>
          <MnAvatarGroup max={3}>
            <MnAvatar initials="AB" size="md" />
            <MnAvatar initials="CD" size="md" />
            <MnAvatar initials="EF" size="md" />
            <MnAvatar initials="GH" size="md" />
            <MnAvatar initials="IL" size="md" />
          </MnAvatarGroup>
        </ShowcaseCard>

        {/* Form Field */}
        <ShowcaseCard title="MnFormField">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MnFormField>
              <MnFormFieldLabel required>Email</MnFormFieldLabel>
              <input
                type="email"
                className="w-full rounded-md border border-[var(--mn-border)] bg-[var(--mn-surface-input)] px-3 py-2 text-sm"
                placeholder="name@example.com"
              />
              <MnFormFieldHint>We will never share your email.</MnFormFieldHint>
            </MnFormField>
            <MnFormField error="Password must be at least 8 characters.">
              <MnFormFieldLabel required>Password</MnFormFieldLabel>
              <input
                type="password"
                className="w-full rounded-md border border-[var(--mn-border-error)] bg-[var(--mn-surface-input)] px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </MnFormField>
          </div>
        </ShowcaseCard>

        {/* State Scaffold */}
        <ShowcaseCard title="MnStateScaffold">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <MnStateScaffold state="loading" message="Loading data…" />
            <MnStateScaffold state="empty" message="No results found. Try a different search query." onAction={() => toast.info("Action clicked")} actionLabel="Create new" />
            <MnStateScaffold state="error" message="Unable to load data." onRetry={() => toast.info("Retrying…")} />
          </div>
        </ShowcaseCard>

        {/* Tabs */}
        <ShowcaseCard title="MnTabs">
          <MnTabs defaultValue="overview">
            <MnTabList>
              <MnTab value="overview">Overview</MnTab>
              <MnTab value="analytics">Analytics</MnTab>
              <MnTab value="settings">Settings</MnTab>
            </MnTabList>
            <MnTabPanel value="overview">
              <div className="p-4 rounded-b-lg border border-t-0 border-[var(--mn-border)]">
                <p>Overview panel — KPIs, charts, and summaries go here.</p>
              </div>
            </MnTabPanel>
            <MnTabPanel value="analytics">
              <div className="p-4 rounded-b-lg border border-t-0 border-[var(--mn-border)]">
                <p>Analytics panel — traffic, conversions, and trends.</p>
              </div>
            </MnTabPanel>
            <MnTabPanel value="settings">
              <div className="p-4 rounded-b-lg border border-t-0 border-[var(--mn-border)]">
                <p>Settings panel — preferences and configuration.</p>
              </div>
            </MnTabPanel>
          </MnTabs>
        </ShowcaseCard>

        {/* Modal + Toast */}
        <ShowcaseCard title="MnModal + MnToast">
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setModalOpen(true)} className={btn}>Open Modal</button>
            <button onClick={() => toast.success("Operation completed")} className={btn}>Toast Success</button>
            <button onClick={() => toast.error("Something failed")} className={btn}>Toast Error</button>
            <button onClick={() => toast.warning("Careful!")} className={btn}>Toast Warning</button>
            <button onClick={() => toast.info("FYI")} className={btn}>Toast Info</button>
          </div>
          <MnModal open={modalOpen} onOpenChange={setModalOpen} title="Maranello Modal">
            <div className="space-y-4">
              <p className="text-[var(--mn-text-muted)]">Focus trap • Escape to close • Backdrop click</p>
              <button onClick={() => setModalOpen(false)} className={btn}>Close</button>
            </div>
          </MnModal>
        </ShowcaseCard>

        {/* Customer Journey */}
        <ShowcaseCard title="MnCustomerJourney">
          <MnCustomerJourney
            phases={[
              {
                id: "awareness",
                label: "Awareness",
                engagements: [
                  { id: "e1", title: "Website Visit", status: "completed", type: "task", date: "2025-01-15" },
                  { id: "e2", title: "Webinar Signup", status: "completed", type: "meeting", date: "2025-01-18" },
                ],
              },
              {
                id: "consideration",
                label: "Consideration",
                engagements: [
                  { id: "e3", title: "Product Demo", status: "active", type: "meeting", assignee: "MR", date: "2025-01-25" },
                  { id: "e4", title: "Technical Review", status: "pending", type: "task", date: "2025-02-01" },
                ],
              },
              {
                id: "decision",
                label: "Decision",
                engagements: [
                  { id: "e5", title: "Proposal Sent", status: "pending", type: "opportunity", date: "2025-02-10" },
                  { id: "e6", title: "Contract Review", status: "blocked", type: "contract", date: "2025-02-15" },
                ],
              },
              {
                id: "closed",
                label: "Closed Won",
                engagements: [
                  { id: "e7", title: "Onboarding Kick-off", status: "pending", type: "meeting", date: "2025-03-01" },
                ],
              },
            ]}
            onSelect={(e) => toast.info(`Selected: ${e.title}`)}
          />
        </ShowcaseCard>

        {/* Dashboard */}
        <ShowcaseCard title="MnDashboard">
          <MnDashboard
            schema={{
              rows: [
                {
                  columns: [
                    { type: "kpi-strip", dataKey: "revenue", span: 3 },
                    { type: "kpi-strip", dataKey: "users", span: 3 },
                    { type: "kpi-strip", dataKey: "conversion", span: 3 },
                    { type: "kpi-strip", dataKey: "nps", span: 3 },
                  ],
                },
                {
                  columns: [
                    { type: "stat-card", dataKey: "uptime", span: 4 },
                    { type: "stat-card", dataKey: "latency", span: 4 },
                    { type: "stat-card", dataKey: "errors", span: 4 },
                  ],
                },
              ],
            }}
            data={{
              revenue: { label: "Revenue", value: "$1.2M", change: "+12%" },
              users: { label: "Active Users", value: "45.2K", change: "+8%" },
              conversion: { label: "Conversion", value: "3.2%", change: "+0.4%" },
              nps: { label: "NPS Score", value: "72", change: "+5" },
              uptime: { label: "Uptime", value: "99.97%" },
              latency: { label: "Avg Latency", value: "42ms" },
              errors: { label: "Error Rate", value: "0.03%" },
            }}
            renderWidget={(widget, data) => {
              const d = data as Record<string, string> | undefined
              if (!d) return <div className="p-4 text-[var(--mn-text-muted)]">{widget.dataKey}</div>
              return (
                <div className="flex flex-col gap-1 p-4">
                  <span className="text-xs uppercase tracking-wider text-[var(--mn-text-muted)]">
                    {d.label ?? widget.dataKey}
                  </span>
                  <span className="text-2xl font-bold">{d.value ?? "—"}</span>
                  {d.change != null && (
                    <span className="text-xs text-[var(--mn-success)]">{d.change}</span>
                  )}
                </div>
              )
            }}
          />
        </ShowcaseCard>
      </ShowcaseSection>

      {/* ══════════════════════════════════════════════════════════════════════
         WAVE 2 — Shell / Navigation
         ══════════════════════════════════════════════════════════════════════ */}
      <ShowcaseSection
        id="wave-2"
        title="Wave 2 — Shell & Navigation"
        description="Command palette, header shell, section nav, theme controls, async select, date picker, profile, accessibility"
      >
        {/* Command Palette */}
        <ShowcaseCard title="MnCommandPalette">
          <button onClick={() => setCmdPaletteOpen(true)} className={btn}>
            Open Command Palette (⌘K)
          </button>
          <MnCommandPalette
            open={cmdPaletteOpen}
            onOpenChange={setCmdPaletteOpen}
            items={[
              { text: "Go to Dashboard", shortcut: "⌘D", group: "Navigation" },
              { text: "Go to Settings", shortcut: "⌘,", group: "Navigation" },
              { text: "Go to Projects", group: "Navigation" },
              { text: "Create New Project", shortcut: "⌘N", group: "Actions" },
              { text: "Toggle Theme", shortcut: "⌘T", group: "Actions" },
              { text: "Open Documentation", group: "Actions" },
              { text: "Invite Team Member", group: "Actions" },
              { text: "View Changelog", group: "Help" },
              { text: "Contact Support", group: "Help" },
            ]}
            onSelect={(item) => toast.info(`Selected: ${item.text}`)}
          />
        </ShowcaseCard>

        {/* Header Shell */}
        <ShowcaseCard title="MnHeaderShell">
          <MnHeaderShell
            sections={[
              { type: "brand", label: "Convergio" },
              { type: "spacer" },
              { type: "search", placeholder: "Search anything…", shortcut: "/" },
              { type: "divider" },
              {
                type: "actions",
                role: "post",
                items: [
                  { id: "notif", title: "Notifications", icon: "🔔" },
                  { id: "help", title: "Help", icon: "❓" },
                  { id: "settings", title: "Settings", icon: "⚙️" },
                ],
              },
            ]}
            callbacks={{
              onAction: ({ id }) => toast.info(`Action: ${id}`),
              onSearch: ({ query }) => toast.info(`Search: ${query}`),
            }}
          />
        </ShowcaseCard>

        {/* Section Nav */}
        <ShowcaseCard title="MnSectionNav">
          <MnSectionNav
            items={[
              { id: "overview", label: "Overview" },
              { id: "analytics", label: "Analytics" },
              { id: "reports", label: "Reports" },
              { id: "settings", label: "Settings" },
            ]}
            current={sectionNavCurrent}
            onNavigate={setSectionNavCurrent}
          />
          <p className="text-sm text-[var(--mn-text-muted)]">Current section: <strong>{sectionNavCurrent}</strong></p>
        </ShowcaseCard>

        {/* Theme controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShowcaseCard title="MnThemeToggle">
            <div className="flex items-center gap-4">
              <MnThemeToggle size="sm" />
              <MnThemeToggle />
              <MnThemeToggle size="lg" showLabel />
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="MnThemeRotary">
            <MnThemeRotary />
          </ShowcaseCard>
        </div>

        {/* Async Select + Date Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShowcaseCard title="MnAsyncSelect">
            <MnAsyncSelect
              provider={searchTechnologies}
              placeholder="Search frameworks…"
              onSelect={(item) => toast.info(`Selected: ${item.label}`)}
            />
          </ShowcaseCard>

          <ShowcaseCard title="MnDatePicker">
            <MnDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              min="2025-01-01"
              max="2025-12-31"
            />
            <p className="text-sm text-[var(--mn-text-muted)]">Selected: <strong>{selectedDate}</strong></p>
          </ShowcaseCard>
        </div>

        {/* Profile + A11y */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShowcaseCard title="MnProfile">
            <MnProfile
              name="Roberto Danieli"
              email="roberto@convergio.dev"
              sections={[
                {
                  title: "Account",
                  items: [
                    { label: "Profile", icon: "👤" },
                    { label: "Settings", icon: "⚙️" },
                    { label: "Billing", icon: "💳", badge: "Pro" },
                  ],
                },
                {
                  title: "Team",
                  items: [
                    { label: "Invite members", icon: "📧" },
                    { label: "Notifications", icon: "🔔", badge: 5 },
                  ],
                },
                {
                  items: [
                    { label: "Sign out", danger: true, onClick: () => toast.info("Signed out") },
                  ],
                },
              ]}
            />
          </ShowcaseCard>

          <ShowcaseCard title="MnA11y">
            <p className="text-sm text-[var(--mn-text-muted)]">
              The accessibility FAB is rendered at the bottom-right of the viewport.
              Click it to adjust font size, reduce motion, enable high contrast, or toggle focus outlines.
            </p>
          </ShowcaseCard>
        </div>
      </ShowcaseSection>

      {/* ══════════════════════════════════════════════════════════════════════
         WAVE 3 — Data-Heavy Components
         ══════════════════════════════════════════════════════════════════════ */}
      <ShowcaseSection
        id="wave-3"
        title="Wave 3 — Data Components"
        description="Data tables, detail panels, entity workbench, facet filters, chat, OKRs, system status"
      >
        {/* Data Table */}
        <ShowcaseCard title="MnDataTable">
          <MnDataTable
            columns={[
              { key: "name", label: "Car", sortable: true },
              { key: "team", label: "Team", sortable: true },
              { key: "points", label: "Points", sortable: true, align: "right" },
            ]}
            data={sampleTableData}
            pageSize={3}
            selectable="multi"
            onRowClick={(row) => toast.info(`Clicked: ${(row as Record<string, unknown>).name}`)}
          />
        </ShowcaseCard>

        {/* Detail Panel */}
        <ShowcaseCard title="MnDetailPanel">
          <button onClick={() => setDetailPanelOpen(true)} className={btn}>
            Open Detail Panel
          </button>
          <MnDetailPanel
            open={detailPanelOpen}
            onOpenChange={setDetailPanelOpen}
            title="User Details"
            editable
            sections={[
              {
                title: "General Information",
                fields: [
                  { key: "name", label: "Full Name", value: "Roberto Danieli", type: "text" },
                  { key: "email", label: "Email", value: "roberto@convergio.dev", type: "text" },
                  {
                    key: "role",
                    label: "Role",
                    value: "admin",
                    type: "select",
                    options: [
                      { value: "admin", label: "Admin" },
                      { value: "editor", label: "Editor" },
                      { value: "viewer", label: "Viewer" },
                    ],
                  },
                  { key: "active", label: "Active", value: true, type: "boolean" },
                ],
              },
              {
                title: "Preferences",
                fields: [
                  { key: "timezone", label: "Timezone", value: "Europe/Rome", type: "text" },
                  { key: "lang", label: "Language", value: "English", type: "readonly" },
                ],
              },
            ]}
            onSave={(data) => toast.success(`Saved: ${JSON.stringify(data).slice(0, 60)}…`)}
          />
        </ShowcaseCard>

        {/* Entity Workbench */}
        <ShowcaseCard title="MnEntityWorkbench">
          <MnEntityWorkbench
            tabs={[
              { id: "user-123", label: "User #123" },
              { id: "order-456", label: "Order #456", dirty: true },
              { id: "product-789", label: "Product #789" },
            ]}
            activeTabId={entityActiveTab}
            onTabSelect={setEntityActiveTab}
            onTabClose={(id) => toast.info(`Closed tab: ${id}`)}
            onTabAdd={() => toast.info("Add new tab")}
            onSave={(id) => toast.success(`Saved: ${id}`)}
            renderContent={(tab) => (
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-2">{tab.label}</h4>
                <p className="text-[var(--mn-text-muted)]">
                  Content for entity &ldquo;{tab.id}&rdquo;. Edit fields, view history, manage relationships.
                </p>
              </div>
            )}
          />
        </ShowcaseCard>

        {/* Facet Workbench */}
        <ShowcaseCard title="MnFacetWorkbench">
          <MnFacetWorkbench
            groups={[
              {
                id: "status",
                label: "Status",
                type: "multi-select",
                options: [
                  { id: "active", label: "Active", count: 234 },
                  { id: "inactive", label: "Inactive", count: 56 },
                  { id: "pending", label: "Pending", count: 12 },
                ],
              },
              {
                id: "category",
                label: "Category",
                type: "single-select",
                options: [
                  { id: "electronics", label: "Electronics", count: 145 },
                  { id: "clothing", label: "Clothing", count: 89 },
                  { id: "books", label: "Books", count: 67 },
                ],
              },
              {
                id: "rating",
                label: "Rating",
                options: [
                  { id: "5star", label: "5 Stars", count: 42 },
                  { id: "4star", label: "4 Stars", count: 78 },
                  { id: "3star", label: "3 Stars", count: 35 },
                ],
              },
            ]}
            filters={facetFilters}
            onFilterChange={setFacetFilters}
          />
          <p className="text-sm text-[var(--mn-text-muted)]">
            Active filters: {JSON.stringify(facetFilters)}
          </p>
        </ShowcaseCard>

        {/* Chat */}
        <ShowcaseCard title="MnChat">
          <div className="w-full h-[500px]">
            <MnChat
              messages={chatMessages}
              quickActions={[
                { label: "📊 Show metrics", action: "show-metrics" },
                { label: "📈 Compare periods", action: "compare" },
                { label: "🎯 Top performers", action: "top-performers" },
              ]}
              onSend={handleChatSend}
              onQuickAction={(action) => toast.info(`Quick action: ${action}`)}
            />
          </div>
        </ShowcaseCard>

        {/* OKR */}
        <ShowcaseCard title="MnOkr">
          <MnOkr
            title="Q1 2025 Objectives"
            period="Jan — Mar 2025"
            objectives={[
              {
                id: "obj-1",
                title: "Increase platform adoption",
                status: "on-track",
                keyResults: [
                  { id: "kr-1", title: "Reach 10K MAU", current: 7800, target: 10000 },
                  { id: "kr-2", title: "NPS score > 60", current: 55, target: 60 },
                  { id: "kr-3", title: "Reduce onboarding time to < 5 min", current: 6.2, target: 5, unit: "min" },
                ],
              },
              {
                id: "obj-2",
                title: "Improve conversion funnel",
                status: "at-risk",
                keyResults: [
                  { id: "kr-4", title: "Signup → Active > 40%", current: 32, target: 40, unit: "%" },
                  { id: "kr-5", title: "Reduce churn to < 5%", current: 6.2, target: 5, unit: "%" },
                ],
              },
              {
                id: "obj-3",
                title: "Ship Maranello Design System",
                status: "on-track",
                keyResults: [
                  { id: "kr-6", title: "Complete all 36 components", current: 36, target: 36 },
                  { id: "kr-7", title: "WCAG AA compliance > 95%", current: 92, target: 95, unit: "%" },
                ],
              },
            ]}
          />
        </ShowcaseCard>

        {/* System Status */}
        <ShowcaseCard title="MnSystemStatus">
          <MnSystemStatus
            services={[
              { id: "api", name: "API Gateway", status: "operational", uptime: 99.98, latencyMs: 45 },
              { id: "db", name: "Database Cluster", status: "operational", uptime: 99.99, latencyMs: 12 },
              { id: "ml", name: "ML Pipeline", status: "degraded", uptime: 97.5, latencyMs: 890 },
              { id: "cdn", name: "CDN", status: "operational", uptime: 100, latencyMs: 8 },
              { id: "auth", name: "Auth Service", status: "operational", uptime: 99.95, latencyMs: 23 },
              { id: "queue", name: "Message Queue", status: "operational", uptime: 99.97, latencyMs: 5 },
            ]}
            incidents={[
              { id: "inc-1", title: "ML Pipeline latency spike", severity: "degraded", date: "2026-04-01T18:00:00Z" },
              { id: "inc-2", title: "CDN cache purge completed", severity: "operational", date: "2026-03-31T12:00:00Z", resolved: true },
            ]}
            version="2.4.1"
            environment="production"
          />
        </ShowcaseCard>
      </ShowcaseSection>

      {/* ══════════════════════════════════════════════════════════════════════
         WAVE 4 — Canvas / Visual Components
         ══════════════════════════════════════════════════════════════════════ */}
      <ShowcaseSection
        id="wave-4"
        title="Wave 4 — Canvas & Visual"
        description="Charts, gauges, speedometers, funnels, horizontal bars, Gantt, Kanban, maps, Ferrari controls"
      >
        {/* Charts */}
        <ShowcaseCard title="MnChart">
          <MnTabs defaultValue="area">
            <MnTabList>
              <MnTab value="area">Area</MnTab>
              <MnTab value="bar">Bar</MnTab>
              <MnTab value="sparkline">Sparkline</MnTab>
              <MnTab value="donut">Donut</MnTab>
              <MnTab value="radar">Radar</MnTab>
              <MnTab value="bubble">Bubble</MnTab>
            </MnTabList>
            <MnTabPanel value="area">
              <div className="w-full h-[300px] mt-4">
                <MnChart
                  type="area"
                  series={[
                    { label: "Revenue", data: [120, 180, 150, 220, 280, 310, 290, 340, 380, 420, 460, 510], color: "#3B82F6" },
                    { label: "Costs", data: [80, 90, 85, 110, 130, 140, 135, 150, 160, 180, 190, 210], color: "#F59E0B" },
                  ]}
                  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
                  showLegend
                  className="w-full h-full"
                />
              </div>
            </MnTabPanel>
            <MnTabPanel value="bar">
              <div className="w-full h-[300px] mt-4">
                <MnChart
                  type="bar"
                  series={[
                    { label: "Q1", data: [340, 280, 190, 420, 310], color: "#6366F1" },
                    { label: "Q2", data: [410, 350, 240, 380, 290], color: "#10B981" },
                  ]}
                  labels={["Product A", "Product B", "Product C", "Product D", "Product E"]}
                  showLegend
                  className="w-full h-full"
                />
              </div>
            </MnTabPanel>
            <MnTabPanel value="sparkline">
              <div className="w-full h-[120px] mt-4">
                <MnChart
                  type="sparkline"
                  series={[{ label: "Trend", data: [20, 45, 28, 80, 99, 43, 60, 72, 88, 95, 78, 110] }]}
                  className="w-full h-full"
                />
              </div>
            </MnTabPanel>
            <MnTabPanel value="donut">
              <div className="w-full h-[300px] mt-4">
                <MnChart
                  type="donut"
                  segments={[
                    { label: "Desktop", value: 55, color: "#3B82F6" },
                    { label: "Mobile", value: 35, color: "#10B981" },
                    { label: "Tablet", value: 10, color: "#F59E0B" },
                  ]}
                  showLegend
                  className="w-full h-full"
                />
              </div>
            </MnTabPanel>
            <MnTabPanel value="radar">
              <div className="w-full h-[300px] mt-4">
                <MnChart
                  type="radar"
                  radarData={[
                    { label: "Speed", value: 85 },
                    { label: "Reliability", value: 92 },
                    { label: "UX", value: 78 },
                    { label: "Cost Efficiency", value: 65 },
                    { label: "Security", value: 88 },
                    { label: "Scalability", value: 72 },
                  ]}
                  className="w-full h-full"
                />
              </div>
            </MnTabPanel>
            <MnTabPanel value="bubble">
              <div className="w-full h-[300px] mt-4">
                <MnChart
                  type="bubble"
                  points={[
                    { x: 20, y: 30, z: 15, label: "Product A", color: "#3B82F6" },
                    { x: 40, y: 65, z: 10, label: "Product B", color: "#10B981" },
                    { x: 70, y: 45, z: 25, label: "Product C", color: "#F59E0B" },
                    { x: 55, y: 80, z: 8, label: "Product D", color: "#EF4444" },
                    { x: 85, y: 20, z: 18, label: "Product E", color: "#8B5CF6" },
                  ]}
                  showLegend
                  className="w-full h-full"
                />
              </div>
            </MnTabPanel>
          </MnTabs>
        </ShowcaseCard>

        {/* Gauge + Speedometer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShowcaseCard title="MnGauge">
            <div className="flex justify-center">
              <MnGauge
                value={73}
                min={0}
                max={100}
                unit="%"
                label="System Health"
                size="md"
                arcBar={{ value: 73, max: 100, labelCenter: "73%", labelLeft: "0", labelRight: "100" }}
              />
            </div>
          </ShowcaseCard>

          <ShowcaseCard title="MnSpeedometer">
            <div className="flex justify-center">
              <MnSpeedometer
                value={185}
                min={0}
                max={320}
                unit="km/h"
                size="md"
              />
            </div>
          </ShowcaseCard>
        </div>

        {/* Funnel */}
        <ShowcaseCard title="MnFunnel">
          <MnFunnel
            data={{
              pipeline: [
                { label: "Visitors", count: 12500, color: "#3B82F6" },
                { label: "Leads", count: 8200, color: "#6366F1" },
                { label: "Qualified", count: 4100, color: "#8B5CF6" },
                { label: "Proposals", count: 1800, color: "#A855F7" },
                { label: "Negotiations", count: 1100, color: "#D946EF" },
                { label: "Closed Won", count: 920, color: "#10B981" },
              ],
              total: 12500,
              onHold: { count: 340 },
              withdrawn: { count: 180 },
            }}
            onStageClick={(stage) => toast.info(`Stage: ${stage.label} (${stage.count})`)}
          />
        </ShowcaseCard>

        {/* Horizontal Bar */}
        <ShowcaseCard title="MnHbar">
          <MnHbar
            title="Traffic Sources"
            unit="%"
            bars={[
              { label: "Organic Search", value: 42, color: "#3B82F6" },
              { label: "Direct", value: 28, color: "#10B981" },
              { label: "Social Media", value: 18, color: "#F59E0B" },
              { label: "Email", value: 8, color: "#8B5CF6" },
              { label: "Referral", value: 4, color: "#EF4444" },
            ]}
            maxValue={50}
            onBarClick={(bar) => toast.info(`${bar.label}: ${bar.value}%`)}
          />
        </ShowcaseCard>

        {/* Gantt */}
        <ShowcaseCard title="MnGantt">
          <div className="w-full overflow-x-auto">
            <MnGantt
              tasks={[
                {
                  id: "design", title: "Design Phase", start: "2025-01-06", end: "2025-01-24", status: "completed",
                  children: [
                    { id: "wireframes", title: "Wireframes", start: "2025-01-06", end: "2025-01-14", status: "completed", progress: 100 },
                    { id: "mockups", title: "Visual Mockups", start: "2025-01-12", end: "2025-01-24", status: "completed", progress: 100 },
                  ],
                },
                {
                  id: "development", title: "Development", start: "2025-01-20", end: "2025-02-21", status: "active",
                  children: [
                    { id: "frontend", title: "Frontend Dev", start: "2025-01-20", end: "2025-02-21", status: "active", progress: 65, dependencies: ["design"] },
                    { id: "backend", title: "Backend API", start: "2025-01-20", end: "2025-02-14", status: "active", progress: 80, dependencies: ["design"] },
                  ],
                },
                { id: "integration", title: "Integration", start: "2025-02-10", end: "2025-02-28", status: "planned", progress: 0, dependencies: ["frontend", "backend"] },
                { id: "testing", title: "QA Testing", start: "2025-02-24", end: "2025-03-14", status: "on-hold", progress: 0, dependencies: ["integration"] },
                { id: "launch", title: "🚀 Launch", start: "2025-03-14", end: "2025-03-14", status: "planned", milestone: true, dependencies: ["testing"] },
              ]}
              showToday
            />
          </div>
        </ShowcaseCard>

        {/* Kanban Board */}
        <ShowcaseCard title="MnKanbanBoard">
          <MnKanbanBoard
            columns={[
              { id: "backlog", title: "Backlog", color: "#6B7280" },
              { id: "todo", title: "To Do", color: "#3B82F6" },
              { id: "doing", title: "In Progress", color: "#F59E0B" },
              { id: "done", title: "Done", color: "#10B981" },
            ]}
            cards={kanbanCards}
            onCardMove={handleKanbanMove}
            onCardClick={(card) => toast.info(`Card: ${card.title}`)}
            onAddCard={(colId) => toast.info(`Add card to: ${colId}`)}
          />
        </ShowcaseCard>

        {/* Map (SVG) */}
        <ShowcaseCard title="MnMap">
          <div className="w-full h-[400px]">
            <MnMap
              markers={[
                { id: 1, lat: 40.7128, lon: -74.006, label: "New York", detail: "HQ Office", color: "active", size: "lg" },
                { id: 2, lat: 51.5074, lon: -0.1278, label: "London", detail: "EU Office", color: "active" },
                { id: 3, lat: 35.6762, lon: 139.6503, label: "Tokyo", detail: "APAC Office", color: "warning" },
                { id: 4, lat: -33.8688, lon: 151.2093, label: "Sydney", detail: "Support Center", color: "danger" },
                { id: 5, lat: 43.7696, lon: 11.2558, label: "Florence", detail: "Design Studio", color: "active", size: "lg" },
              ]}
              zoom={1}
              enableZoom
              enablePan
              onMarkerClick={(m) => toast.info(`${m.label}: ${m.detail ?? ""}`)}
              className="w-full h-full"
            />
          </div>
        </ShowcaseCard>

        {/* Ferrari Controls */}
        <ShowcaseCard title="Ferrari Controls: Manettino, CruiseLever, ToggleLever, SteppedRotary">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-3">
              <MnManettino
                label="Manettino"
                positions={["WET", "COMFORT", "SPORT", "RACE", "ESC OFF"]}
                defaultValue={2}
                onChange={(i, label) => toast.info(`Manettino: ${label} (${i})`)}
              />
              <span className="text-sm text-[var(--mn-text-muted)]">Drive Mode</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MnCruiseLever
                label="Cruise"
                positions={["OFF", "SET", "RES", "ACC"]}
                defaultValue={0}
                onChange={(i, label) => toast.info(`Cruise: ${label} (${i})`)}
              />
              <span className="text-sm text-[var(--mn-text-muted)]">Cruise Control</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MnToggleLever
                label="DRS"
                onChange={(on) => toast.info(`DRS: ${on ? "ON" : "OFF"}`)}
              />
              <span className="text-sm text-[var(--mn-text-muted)]">DRS Toggle</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MnSteppedRotary
                label="Brake Bias"
                positions={["54%", "56%", "58%", "60%", "62%"]}
                defaultValue={2}
                onChange={(i, label) => toast.info(`Brake Bias: ${label} (${i})`)}
              />
              <span className="text-sm text-[var(--mn-text-muted)]">Brake Bias</span>
            </div>
          </div>
        </ShowcaseCard>
      </ShowcaseSection>

      {/* Global providers */}
      <MnToast />
      <MnA11y />
    </div>
  )
}
