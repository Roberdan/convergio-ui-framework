"use client"

import {
  MnBadge,
  MnAvatar,
  MnAvatarGroup,
  MnBreadcrumb,
  MnFormField,
  MnFormFieldLabel,
  MnFormFieldHint,
  MnFormFieldError,
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
} from "@/components/maranello"

import { useState } from "react"

export default function MaranelloPreview() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--mn-surface)] text-[var(--mn-text)] p-8 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          🏎️ Maranello Design System — Preview
        </h1>
        <p className="text-[var(--mn-text-muted)]">
          Wave 0 + Wave 1 components migrated to React/Tailwind/CVA
        </p>
      </header>

      {/* Badges */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold border-b border-[var(--mn-border)] pb-2">
          MnBadge
        </h2>
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
        <h2 className="text-xl font-semibold border-b border-[var(--mn-border)] pb-2">
          MnAvatar + MnAvatarGroup
        </h2>
        <div className="flex items-center gap-6">
          <MnAvatar initials="RD" size="sm" status="online" />
          <MnAvatar initials="MR" size="md" status="busy" />
          <MnAvatar initials="LB" size="lg" status="away" />
          <MnAvatar
            initials="FE"
            size="xl"
            src="https://avatars.githubusercontent.com/u/1?v=4"
            alt="Ferrari"
          />
        </div>
        <MnAvatarGroup max={3}>
          <MnAvatar initials="AB" size="md" />
          <MnAvatar initials="CD" size="md" />
          <MnAvatar initials="EF" size="md" />
          <MnAvatar initials="GH" size="md" />
          <MnAvatar initials="IL" size="md" />
        </MnAvatarGroup>
      </section>

      {/* Breadcrumb */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold border-b border-[var(--mn-border)] pb-2">
          MnBreadcrumb
        </h2>
        <MnBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Components", href: "/preview" },
            { label: "Preview" },
          ]}
        />
      </section>

      {/* Form Field */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold border-b border-[var(--mn-border)] pb-2">
          MnFormField
        </h2>
        <div className="max-w-md space-y-4">
          <MnFormField>
            <MnFormFieldLabel required>Email</MnFormFieldLabel>
            <input
              type="email"
              className="w-full rounded-md border border-[var(--mn-border)] bg-[var(--mn-surface-raised)] px-3 py-2 text-sm"
              placeholder="name@example.com"
            />
            <MnFormFieldHint>We will never share your email.</MnFormFieldHint>
          </MnFormField>
          <MnFormField error="Password must be at least 8 characters.">
            <MnFormFieldLabel required>Password</MnFormFieldLabel>
            <input
              type="password"
              className="w-full rounded-md border border-red-500 bg-[var(--mn-surface-raised)] px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </MnFormField>
        </div>
      </section>

      {/* State Scaffold */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold border-b border-[var(--mn-border)] pb-2">
          MnStateScaffold
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MnStateScaffold state="loading" title="Loading data...">
            <p>Content</p>
          </MnStateScaffold>
          <MnStateScaffold state="empty" title="No results" message="Try a different search query." />
          <MnStateScaffold
            state="error"
            title="Something went wrong"
            message="Unable to load data."
            onRetry={() => toast.info("Retrying...")}
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold border-b border-[var(--mn-border)] pb-2">
          MnTabs
        </h2>
        <MnTabs defaultValue="overview">
          <MnTabList>
            <MnTab value="overview">Overview</MnTab>
            <MnTab value="analytics">Analytics</MnTab>
            <MnTab value="settings">Settings</MnTab>
          </MnTabList>
          <MnTabPanel value="overview">
            <div className="p-4 rounded-b-lg border border-t-0 border-[var(--mn-border)]">
              <p>Overview panel content — KPIs, charts, and summaries go here.</p>
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

      {/* Modal */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold border-b border-[var(--mn-border)] pb-2">
          MnModal
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-md bg-[var(--mn-accent)] text-[var(--mn-accent-text)] font-medium hover:opacity-90 transition-opacity"
        >
          Open Modal
        </button>
        <MnModal open={modalOpen} onOpenChange={setModalOpen}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Maranello Modal</h3>
            <p className="text-[var(--mn-text-muted)]">
              This modal has focus trap, Escape to close, and backdrop click support.
            </p>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-md bg-[var(--mn-accent)] text-[var(--mn-accent-text)] font-medium"
            >
              Close
            </button>
          </div>
        </MnModal>
      </section>

      {/* Toast */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold border-b border-[var(--mn-border)] pb-2">
          MnToast
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => toast.success("Operation completed")}
            className="px-3 py-1.5 rounded-md bg-green-600 text-[var(--mn-accent-text)] text-sm"
          >
            Success
          </button>
          <button
            onClick={() => toast.error("Something failed")}
            className="px-3 py-1.5 rounded-md bg-red-600 text-[var(--mn-accent-text)] text-sm"
          >
            Error
          </button>
          <button
            onClick={() => toast.warning("Careful with this action")}
            className="px-3 py-1.5 rounded-md bg-yellow-600 text-[var(--mn-accent-text)] text-sm"
          >
            Warning
          </button>
          <button
            onClick={() => toast.info("Here is some info")}
            className="px-3 py-1.5 rounded-md bg-blue-600 text-[var(--mn-accent-text)] text-sm"
          >
            Info
          </button>
        </div>
      </section>

      <MnToast />
    </div>
  )
}
