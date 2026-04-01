"use client"

import {
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
  MnDataTable,
  MnOkr,
  MnSystemStatus,
  MnChat,
  type ChatMessage,
} from "@/components/maranello"

import { useState } from "react"

const btn = "px-4 py-2 rounded-md bg-[var(--mn-accent)] text-[var(--mn-accent-text)] font-medium hover:bg-[var(--mn-accent-hover)] transition-colors"
const btnSm = "px-3 py-1.5 rounded-md text-sm font-medium text-white"
const sectionTitle = "text-xl font-semibold border-b border-[var(--mn-border)] pb-2"

const sampleTableData = [
  { id: "1", name: "Ferrari SF-24", team: "Scuderia Ferrari", points: 450 },
  { id: "2", name: "Red Bull RB20", team: "Red Bull Racing", points: 520 },
  { id: "3", name: "McLaren MCL38", team: "McLaren F1", points: 380 },
  { id: "4", name: "Mercedes W15", team: "Mercedes-AMG", points: 310 },
]

const sampleMessages: ChatMessage[] = [
  { id: "1", role: "user", content: "What's our conversion rate this week?", timestamp: new Date(Date.now() - 60000) },
  { id: "2", role: "assistant", content: "Your conversion rate is **3.2%** this week, up from 2.8% last week. The main driver was the new landing page variant B which showed a `+15%` lift in signups.", timestamp: new Date(Date.now() - 30000) },
]

export default function MaranelloPreview() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--mn-surface)] text-[var(--mn-text)] p-6 lg:p-10 space-y-12 w-full">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          🏎️ Maranello Design System — Live Preview
        </h1>
        <p className="text-[var(--mn-text-muted)]">
          27 components migrated across Wave 0–3 • React / Tailwind / CVA
        </p>
        <MnBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/" },
            { label: "Design System Preview" },
          ]}
        />
      </header>

      {/* ── W1: Simple Components ── */}
      <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] p-6 space-y-8 w-full">
        <h2 className="text-2xl font-bold">Wave 1 — Simple Components</h2>

        {/* Badges */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnBadge</h3>
          <div className="flex gap-3 flex-wrap">
            <MnBadge tone="success">Success</MnBadge>
            <MnBadge tone="warning">Warning</MnBadge>
            <MnBadge tone="danger">Danger</MnBadge>
            <MnBadge tone="info">Info</MnBadge>
            <MnBadge tone="neutral">Neutral</MnBadge>
          </div>
        </section>

        {/* Avatars */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnAvatar + MnAvatarGroup</h3>
          <div className="flex items-center gap-6">
            <MnAvatar initials="RD" size="sm" status="online" />
            <MnAvatar initials="MR" size="md" status="busy" />
            <MnAvatar initials="LB" size="lg" status="away" />
            <MnAvatar initials="FE" size="xl" src="https://avatars.githubusercontent.com/u/1?v=4" alt="Ferrari" />
          </div>
          <MnAvatarGroup max={3}>
            <MnAvatar initials="AB" size="md" />
            <MnAvatar initials="CD" size="md" />
            <MnAvatar initials="EF" size="md" />
            <MnAvatar initials="GH" size="md" />
            <MnAvatar initials="IL" size="md" />
          </MnAvatarGroup>
        </section>

        {/* Form Field */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnFormField</h3>
          <div className="max-w-xl space-y-4">
            <MnFormField>
              <MnFormFieldLabel required>Email</MnFormFieldLabel>
              <input type="email" className="w-full rounded-md border border-[var(--mn-border)] bg-[var(--mn-surface-input)] px-3 py-2 text-sm" placeholder="name@example.com" />
              <MnFormFieldHint>We will never share your email.</MnFormFieldHint>
            </MnFormField>
            <MnFormField error="Password must be at least 8 characters.">
              <MnFormFieldLabel required>Password</MnFormFieldLabel>
              <input type="password" className="w-full rounded-md border border-[var(--mn-error)] bg-[var(--mn-surface-input)] px-3 py-2 text-sm" placeholder="••••••••" />
            </MnFormField>
          </div>
        </section>

        {/* State Scaffold */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnStateScaffold</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <MnStateScaffold state="loading" title="Loading data..."><p>Content</p></MnStateScaffold>
            <MnStateScaffold state="empty" title="No results" message="Try a different search query." />
            <MnStateScaffold state="error" title="Something went wrong" message="Unable to load data." onRetry={() => toast.info("Retrying...")} />
          </div>
        </section>

        {/* Tabs */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnTabs</h3>
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
        </section>

        {/* Modal + Toast */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnModal + MnToast</h3>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setModalOpen(true)} className={btn}>Open Modal</button>
            <button onClick={() => toast.success("Operation completed")} className={`${btnSm} bg-green-600`}>Toast Success</button>
            <button onClick={() => toast.error("Something failed")} className={`${btnSm} bg-red-600`}>Toast Error</button>
            <button onClick={() => toast.warning("Careful!")} className={`${btnSm} bg-amber-600`}>Toast Warning</button>
            <button onClick={() => toast.info("FYI")} className={`${btnSm} bg-blue-600`}>Toast Info</button>
          </div>
          <MnModal open={modalOpen} onOpenChange={setModalOpen}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Maranello Modal</h3>
              <p className="text-[var(--mn-text-muted)]">Focus trap • Escape to close • Backdrop click</p>
              <button onClick={() => setModalOpen(false)} className={btn}>Close</button>
            </div>
          </MnModal>
        </section>
      </div>

      {/* ── W3: Data-Heavy Components ── */}
      <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] p-6 space-y-8 w-full">
        <h2 className="text-2xl font-bold">Wave 3 — Data Components</h2>

        {/* Data Table */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnDataTable</h3>
          <MnDataTable
            columns={[
              { key: "name", label: "Car", sortable: true },
              { key: "team", label: "Team", sortable: true },
              { key: "points", label: "Points", sortable: true },
            ]}
            data={sampleTableData}
            pageSize={3}
          />
        </section>

        {/* OKR */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnOkr</h3>
          <MnOkr
            objectives={[
              {
                id: "obj-1",
                title: "Increase platform adoption",
                status: "on-track",
                keyResults: [
                  { id: "kr-1", title: "Reach 10K MAU", current: 7800, target: 10000 },
                  { id: "kr-2", title: "NPS score > 60", current: 55, target: 60 },
                ],
              },
              {
                id: "obj-2",
                title: "Improve conversion funnel",
                status: "at-risk",
                keyResults: [
                  { id: "kr-3", title: "Signup → Active > 40%", current: 32, target: 40 },
                  { id: "kr-4", title: "Reduce churn to < 5%", current: 6.2, target: 5 },
                ],
              },
            ]}
          />
        </section>

        {/* System Status */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnSystemStatus</h3>
          <MnSystemStatus
            services={[
              { id: "api", name: "API Gateway", status: "operational", uptime: 99.98, latencyMs: 45 },
              { id: "db", name: "Database Cluster", status: "operational", uptime: 99.99, latencyMs: 12 },
              { id: "ml", name: "ML Pipeline", status: "degraded", uptime: 97.5, latencyMs: 890 },
              { id: "cdn", name: "CDN", status: "operational", uptime: 100, latencyMs: 8 },
            ]}
            incidents={[
              { id: "inc-1", title: "ML Pipeline latency spike", severity: "degraded", date: new Date().toISOString() },
            ]}
          />
        </section>

        {/* Chat */}
        <section className="space-y-3">
          <h3 className={sectionTitle}>MnChat</h3>
          <div className="w-full h-[500px]">
            <MnChat
              messages={sampleMessages}
              quickActions={[
                { label: "📊 Show metrics", action: "show-metrics" },
                { label: "📈 Compare periods", action: "compare" },
              ]}
              onSend={(msg) => toast.info(`Sent: ${msg}`)}
            />
          </div>
        </section>
      </div>

      <MnToast />
    </div>
  )
}
