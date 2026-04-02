"use client"

import { useState } from "react"
import {
  MnDataTable, MnDetailPanel, MnEntityWorkbench,
  MnFacetWorkbench, MnChat, MnOkr, MnSystemStatus,
} from "@/components/maranello"
import { toast } from "@/components/maranello"
import type { ChatMessage } from "@/components/maranello"
import { ShowcaseSection, ShowcaseCard, btn, sampleTableData, initialMessages } from "./showcase-helpers"

export function PreviewW3() {
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [entityActiveTab, setEntityActiveTab] = useState("user-123")
  const [facetFilters, setFacetFilters] = useState<Record<string, string[]>>({})
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages)

  function handleChatSend(text: string) {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: new Date() }
    setChatMessages((prev) => [...prev, userMsg])
    setTimeout(() => {
      const assistantMsg: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", content: `Thanks for asking about "${text}". This is a demo response.`, timestamp: new Date() }
      setChatMessages((prev) => [...prev, assistantMsg])
    }, 800)
  }

  return (
    <ShowcaseSection
      id="wave-3"
      title="Wave 3 — Data Components"
      description="Data tables, detail panels, entity workbench, facet filters, chat, OKRs, system status"
    >
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

      <ShowcaseCard title="MnDetailPanel">
        <button onClick={() => setDetailPanelOpen(true)} className={btn}>Open Detail Panel</button>
        <MnDetailPanel
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          title="User Details"
          editable
          sections={[
            { title: "General Information", fields: [
              { key: "name", label: "Full Name", value: "Roberto Danieli", type: "text" },
              { key: "email", label: "Email", value: "roberto@convergio.dev", type: "text" },
              { key: "role", label: "Role", value: "admin", type: "select", options: [
                { value: "admin", label: "Admin" },
                { value: "editor", label: "Editor" },
                { value: "viewer", label: "Viewer" },
              ]},
              { key: "active", label: "Active", value: true, type: "boolean" },
            ]},
            { title: "Preferences", fields: [
              { key: "timezone", label: "Timezone", value: "Europe/Rome", type: "text" },
              { key: "lang", label: "Language", value: "English", type: "readonly" },
            ]},
          ]}
          onSave={(data) => toast.success(`Saved: ${JSON.stringify(data).slice(0, 60)}…`)}
        />
      </ShowcaseCard>

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
              <p className="text-[var(--mn-text-muted)]">Content for entity &ldquo;{tab.id}&rdquo;. Edit fields, view history, manage relationships.</p>
            </div>
          )}
        />
      </ShowcaseCard>

      <ShowcaseCard title="MnFacetWorkbench">
        <MnFacetWorkbench
          groups={[
            { id: "status", label: "Status", type: "multi-select", options: [
              { id: "active", label: "Active", count: 234 },
              { id: "inactive", label: "Inactive", count: 56 },
              { id: "pending", label: "Pending", count: 12 },
            ]},
            { id: "category", label: "Category", type: "single-select", options: [
              { id: "electronics", label: "Electronics", count: 145 },
              { id: "clothing", label: "Clothing", count: 89 },
              { id: "books", label: "Books", count: 67 },
            ]},
            { id: "rating", label: "Rating", options: [
              { id: "5star", label: "5 Stars", count: 42 },
              { id: "4star", label: "4 Stars", count: 78 },
              { id: "3star", label: "3 Stars", count: 35 },
            ]},
          ]}
          filters={facetFilters}
          onFilterChange={setFacetFilters}
        />
        <p className="text-sm text-[var(--mn-text-muted)]">Active filters: {JSON.stringify(facetFilters)}</p>
      </ShowcaseCard>

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

      <ShowcaseCard title="MnOkr">
        <MnOkr
          title="Q1 2025 Objectives"
          period="Jan — Mar 2025"
          objectives={[
            { id: "obj-1", title: "Increase platform adoption", status: "on-track", keyResults: [
              { id: "kr-1", title: "Reach 10K MAU", current: 7800, target: 10000 },
              { id: "kr-2", title: "NPS score > 60", current: 55, target: 60 },
              { id: "kr-3", title: "Reduce onboarding time to < 5 min", current: 6.2, target: 5, unit: "min" },
            ]},
            { id: "obj-2", title: "Improve conversion funnel", status: "at-risk", keyResults: [
              { id: "kr-4", title: "Signup → Active > 40%", current: 32, target: 40, unit: "%" },
              { id: "kr-5", title: "Reduce churn to < 5%", current: 6.2, target: 5, unit: "%" },
            ]},
            { id: "obj-3", title: "Ship Maranello Design System", status: "on-track", keyResults: [
              { id: "kr-6", title: "Complete all 36 components", current: 36, target: 36 },
              { id: "kr-7", title: "WCAG AA compliance > 95%", current: 92, target: 95, unit: "%" },
            ]},
          ]}
        />
      </ShowcaseCard>

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
  )
}
