"use client"

import { useState } from "react"
import {
  MnCommandPalette, MnHeaderShell, MnSectionNav,
  MnThemeToggle, MnThemeRotary, MnAsyncSelect,
  MnDatePicker, MnProfile, MnA11y,
} from "@/components/maranello"
import { toast } from "@/components/maranello"
import { ShowcaseSection, ShowcaseCard, btn, searchTechnologies } from "./showcase-helpers"

export function PreviewW2() {
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const [sectionNavCurrent, setSectionNavCurrent] = useState("overview")
  const [selectedDate, setSelectedDate] = useState("2025-01-15")

  return (
    <ShowcaseSection
      id="wave-2"
      title="Wave 2 — Shell & Navigation"
      description="Command palette, header shell, section nav, theme controls, async select, date picker, profile, accessibility"
    >
      <ShowcaseCard title="MnCommandPalette">
        <button onClick={() => setCmdPaletteOpen(true)} className={btn}>Open Command Palette</button>
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

      <ShowcaseCard title="MnHeaderShell">
        <MnHeaderShell
          sections={[
            { type: "brand", label: "Convergio" },
            { type: "spacer" },
            { type: "search", placeholder: "Search anything…", shortcut: "/" },
            { type: "divider" },
            { type: "actions", role: "post", items: [
              { id: "notif", title: "Notifications", icon: "🔔" },
              { id: "help", title: "Help", icon: "❓" },
              { id: "settings", title: "Settings", icon: "⚙️" },
            ]},
          ]}
          callbacks={{
            onAction: ({ id }) => toast.info(`Action: ${id}`),
            onSearch: ({ query }) => toast.info(`Search: ${query}`),
          }}
        />
      </ShowcaseCard>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShowcaseCard title="MnAsyncSelect">
          <MnAsyncSelect
            provider={searchTechnologies}
            placeholder="Search frameworks…"
            onSelect={(item) => toast.info(`Selected: ${item.label}`)}
          />
        </ShowcaseCard>
        <ShowcaseCard title="MnDatePicker">
          <MnDatePicker value={selectedDate} onChange={setSelectedDate} min="2025-01-01" max="2025-12-31" />
          <p className="text-sm text-[var(--mn-text-muted)]">Selected: <strong>{selectedDate}</strong></p>
        </ShowcaseCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShowcaseCard title="MnProfile">
          <MnProfile
            name="Roberto Danieli"
            email="roberto@convergio.dev"
            sections={[
              { title: "Account", items: [
                { label: "Profile", icon: "👤" },
                { label: "Settings", icon: "⚙️" },
                { label: "Billing", icon: "💳", badge: "Pro" },
              ]},
              { title: "Team", items: [
                { label: "Invite members", icon: "📧" },
                { label: "Notifications", icon: "🔔", badge: 5 },
              ]},
              { items: [
                { label: "Sign out", danger: true, onClick: () => toast.info("Signed out") },
              ]},
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
  )
}
