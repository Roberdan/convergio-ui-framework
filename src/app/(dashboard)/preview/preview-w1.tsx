"use client"

import { useState } from "react"
import {
  MnBadge, MnAvatar, MnAvatarGroup, MnBreadcrumb,
  MnFormField, MnFormFieldLabel, MnFormFieldHint,
  MnStateScaffold, MnToast, toast,
  MnTabs, MnTabList, MnTab, MnTabPanel,
  MnModal, MnCustomerJourney, MnDashboard,
} from "@/components/maranello"
import { ShowcaseSection, ShowcaseCard, btn } from "./showcase-helpers"

export function PreviewW1() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <ShowcaseSection
      id="wave-1"
      title="Wave 1 — Simple Components"
      description="Badges, avatars, forms, modals, tabs, toast, state scaffolds, customer journey, dashboard"
    >
      <ShowcaseCard title="MnBadge">
        <div className="flex gap-3 flex-wrap">
          <MnBadge tone="success">Success</MnBadge>
          <MnBadge tone="warning">Warning</MnBadge>
          <MnBadge tone="danger">Danger</MnBadge>
          <MnBadge tone="info">Info</MnBadge>
          <MnBadge tone="neutral">Neutral</MnBadge>
        </div>
      </ShowcaseCard>

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

      <ShowcaseCard title="MnFormField">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MnFormField>
            <MnFormFieldLabel required>Email</MnFormFieldLabel>
            <input type="email" className="w-full rounded-md border border-[var(--mn-border)] bg-[var(--mn-surface-input)] px-3 py-2 text-sm" placeholder="name@example.com" />
            <MnFormFieldHint>We will never share your email.</MnFormFieldHint>
          </MnFormField>
          <MnFormField error="Password must be at least 8 characters.">
            <MnFormFieldLabel required>Password</MnFormFieldLabel>
            <input type="password" className="w-full rounded-md border border-[var(--mn-border-error)] bg-[var(--mn-surface-input)] px-3 py-2 text-sm" placeholder="••••••••" />
          </MnFormField>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="MnStateScaffold">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <MnStateScaffold state="loading" message="Loading data…" />
          <MnStateScaffold state="empty" message="No results found. Try a different search query." onAction={() => toast.info("Action clicked")} actionLabel="Create new" />
          <MnStateScaffold state="error" message="Unable to load data." onRetry={() => toast.info("Retrying…")} />
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="MnTabs">
        <MnTabs defaultValue="overview">
          <MnTabList>
            <MnTab value="overview">Overview</MnTab>
            <MnTab value="analytics">Analytics</MnTab>
            <MnTab value="settings">Settings</MnTab>
          </MnTabList>
          <MnTabPanel value="overview"><div className="p-4 rounded-b-lg border border-t-0 border-[var(--mn-border)]"><p>Overview panel — KPIs, charts, and summaries go here.</p></div></MnTabPanel>
          <MnTabPanel value="analytics"><div className="p-4 rounded-b-lg border border-t-0 border-[var(--mn-border)]"><p>Analytics panel — traffic, conversions, and trends.</p></div></MnTabPanel>
          <MnTabPanel value="settings"><div className="p-4 rounded-b-lg border border-t-0 border-[var(--mn-border)]"><p>Settings panel — preferences and configuration.</p></div></MnTabPanel>
        </MnTabs>
      </ShowcaseCard>

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

      <ShowcaseCard title="MnCustomerJourney">
        <MnCustomerJourney
          phases={[
            { id: "awareness", label: "Awareness", engagements: [
              { id: "e1", title: "Website Visit", status: "completed", type: "task", date: "2025-01-15" },
              { id: "e2", title: "Webinar Signup", status: "completed", type: "meeting", date: "2025-01-18" },
            ]},
            { id: "consideration", label: "Consideration", engagements: [
              { id: "e3", title: "Product Demo", status: "active", type: "meeting", assignee: "MR", date: "2025-01-25" },
              { id: "e4", title: "Technical Review", status: "pending", type: "task", date: "2025-02-01" },
            ]},
            { id: "decision", label: "Decision", engagements: [
              { id: "e5", title: "Proposal Sent", status: "pending", type: "opportunity", date: "2025-02-10" },
              { id: "e6", title: "Contract Review", status: "blocked", type: "contract", date: "2025-02-15" },
            ]},
            { id: "closed", label: "Closed Won", engagements: [
              { id: "e7", title: "Onboarding Kick-off", status: "pending", type: "meeting", date: "2025-03-01" },
            ]},
          ]}
          onSelect={(e) => toast.info(`Selected: ${e.title}`)}
        />
      </ShowcaseCard>

      <ShowcaseCard title="MnDashboard">
        <MnDashboard
          schema={{ rows: [
            { columns: [
              { type: "kpi-strip", dataKey: "revenue", span: 3 },
              { type: "kpi-strip", dataKey: "users", span: 3 },
              { type: "kpi-strip", dataKey: "conversion", span: 3 },
              { type: "kpi-strip", dataKey: "nps", span: 3 },
            ]},
            { columns: [
              { type: "stat-card", dataKey: "uptime", span: 4 },
              { type: "stat-card", dataKey: "latency", span: 4 },
              { type: "stat-card", dataKey: "errors", span: 4 },
            ]},
          ]}}
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
                <span className="text-xs uppercase tracking-wider text-[var(--mn-text-muted)]">{d.label ?? widget.dataKey}</span>
                <span className="text-2xl font-bold">{d.value ?? "—"}</span>
                {d.change != null && <span className="text-xs text-[var(--mn-success)]">{d.change}</span>}
              </div>
            )
          }}
        />
      </ShowcaseCard>
    </ShowcaseSection>
  )
}
