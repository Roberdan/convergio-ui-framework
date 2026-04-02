"use client"

import { useState } from "react"
import {
  MnChart, MnGauge, MnSpeedometer, MnFunnel, MnHbar,
  MnGantt, MnKanbanBoard, MnMap,
  MnManettino, MnCruiseLever, MnToggleLever, MnSteppedRotary,
  MnTabs, MnTabList, MnTab, MnTabPanel,
} from "@/components/maranello"
import { toast } from "@/components/maranello"
import type { KanbanCard } from "@/components/maranello"
import { ShowcaseSection, ShowcaseCard, initialKanbanCards } from "./showcase-helpers"

export function PreviewW4() {
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>(initialKanbanCards)

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
    <ShowcaseSection
      id="wave-4"
      title="Wave 4 — Canvas & Visual"
      description="Charts, gauges, speedometers, funnels, horizontal bars, Gantt, Kanban, maps, Ferrari controls"
    >
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
              <MnChart type="area" series={[
                { label: "Revenue", data: [120, 180, 150, 220, 280, 310, 290, 340, 380, 420, 460, 510], color: "#3B82F6" },
                { label: "Costs", data: [80, 90, 85, 110, 130, 140, 135, 150, 160, 180, 190, 210], color: "#F59E0B" },
              ]} labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]} showLegend className="w-full h-full" />
            </div>
          </MnTabPanel>
          <MnTabPanel value="bar">
            <div className="w-full h-[300px] mt-4">
              <MnChart type="bar" series={[
                { label: "Q1", data: [340, 280, 190, 420, 310], color: "#6366F1" },
                { label: "Q2", data: [410, 350, 240, 380, 290], color: "#10B981" },
              ]} labels={["Product A", "Product B", "Product C", "Product D", "Product E"]} showLegend className="w-full h-full" />
            </div>
          </MnTabPanel>
          <MnTabPanel value="sparkline">
            <div className="w-full h-[120px] mt-4">
              <MnChart type="sparkline" series={[{ label: "Trend", data: [20, 45, 28, 80, 99, 43, 60, 72, 88, 95, 78, 110] }]} className="w-full h-full" />
            </div>
          </MnTabPanel>
          <MnTabPanel value="donut">
            <div className="w-full h-[300px] mt-4">
              <MnChart type="donut" segments={[
                { label: "Desktop", value: 55, color: "#3B82F6" },
                { label: "Mobile", value: 35, color: "#10B981" },
                { label: "Tablet", value: 10, color: "#F59E0B" },
              ]} showLegend className="w-full h-full" />
            </div>
          </MnTabPanel>
          <MnTabPanel value="radar">
            <div className="w-full h-[300px] mt-4">
              <MnChart type="radar" radarData={[
                { label: "Speed", value: 85 }, { label: "Reliability", value: 92 },
                { label: "UX", value: 78 }, { label: "Cost Efficiency", value: 65 },
                { label: "Security", value: 88 }, { label: "Scalability", value: 72 },
              ]} className="w-full h-full" />
            </div>
          </MnTabPanel>
          <MnTabPanel value="bubble">
            <div className="w-full h-[300px] mt-4">
              <MnChart type="bubble" points={[
                { x: 20, y: 30, z: 15, label: "Product A", color: "#3B82F6" },
                { x: 40, y: 65, z: 10, label: "Product B", color: "#10B981" },
                { x: 70, y: 45, z: 25, label: "Product C", color: "#F59E0B" },
                { x: 55, y: 80, z: 8, label: "Product D", color: "#EF4444" },
                { x: 85, y: 20, z: 18, label: "Product E", color: "#8B5CF6" },
              ]} showLegend className="w-full h-full" />
            </div>
          </MnTabPanel>
        </MnTabs>
      </ShowcaseCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShowcaseCard title="MnGauge">
          <div className="flex justify-center">
            <MnGauge value={73} min={0} max={100} unit="%" label="System Health" size="md"
              arcBar={{ value: 73, max: 100, labelCenter: "73%", labelLeft: "0", labelRight: "100" }} />
          </div>
        </ShowcaseCard>
        <ShowcaseCard title="MnSpeedometer">
          <div className="flex justify-center">
            <MnSpeedometer value={185} min={0} max={320} unit="km/h" size="md" />
          </div>
        </ShowcaseCard>
      </div>

      <ShowcaseCard title="MnFunnel">
        <MnFunnel
          data={{ pipeline: [
            { label: "Visitors", count: 12500, color: "#3B82F6" },
            { label: "Leads", count: 8200, color: "#6366F1" },
            { label: "Qualified", count: 4100, color: "#8B5CF6" },
            { label: "Proposals", count: 1800, color: "#A855F7" },
            { label: "Negotiations", count: 1100, color: "#D946EF" },
            { label: "Closed Won", count: 920, color: "#10B981" },
          ], total: 12500, onHold: { count: 340 }, withdrawn: { count: 180 } }}
          onStageClick={(stage) => toast.info(`Stage: ${stage.label} (${stage.count})`)}
        />
      </ShowcaseCard>

      <ShowcaseCard title="MnHbar">
        <MnHbar title="Traffic Sources" unit="%"
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

      <ShowcaseCard title="MnGantt">
        <div className="w-full overflow-x-auto">
          <MnGantt tasks={[
            { id: "design", title: "Design Phase", start: "2025-01-06", end: "2025-01-24", status: "completed", children: [
              { id: "wireframes", title: "Wireframes", start: "2025-01-06", end: "2025-01-14", status: "completed", progress: 100 },
              { id: "mockups", title: "Visual Mockups", start: "2025-01-12", end: "2025-01-24", status: "completed", progress: 100 },
            ]},
            { id: "development", title: "Development", start: "2025-01-20", end: "2025-02-21", status: "active", children: [
              { id: "frontend", title: "Frontend Dev", start: "2025-01-20", end: "2025-02-21", status: "active", progress: 65, dependencies: ["design"] },
              { id: "backend", title: "Backend API", start: "2025-01-20", end: "2025-02-14", status: "active", progress: 80, dependencies: ["design"] },
            ]},
            { id: "integration", title: "Integration", start: "2025-02-10", end: "2025-02-28", status: "planned", progress: 0, dependencies: ["frontend", "backend"] },
            { id: "testing", title: "QA Testing", start: "2025-02-24", end: "2025-03-14", status: "on-hold", progress: 0, dependencies: ["integration"] },
            { id: "launch", title: "🚀 Launch", start: "2025-03-14", end: "2025-03-14", status: "planned", milestone: true, dependencies: ["testing"] },
          ]} showToday />
        </div>
      </ShowcaseCard>

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
            zoom={1} enableZoom enablePan
            onMarkerClick={(m) => toast.info(`${m.label}: ${m.detail ?? ""}`)}
            className="w-full h-full"
          />
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Ferrari Controls: Manettino, CruiseLever, ToggleLever, SteppedRotary">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <div className="flex flex-col items-center gap-3">
            <MnManettino label="Manettino" positions={["WET", "COMFORT", "SPORT", "RACE", "ESC OFF"]} defaultValue={2}
              onChange={(i, label) => toast.info(`Manettino: ${label} (${i})`)} />
            <span className="text-sm text-[var(--mn-text-muted)]">Drive Mode</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <MnCruiseLever label="Cruise" positions={["OFF", "SET", "RES", "ACC"]} defaultValue={0}
              onChange={(i, label) => toast.info(`Cruise: ${label} (${i})`)} />
            <span className="text-sm text-[var(--mn-text-muted)]">Cruise Control</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <MnToggleLever label="DRS" onChange={(on) => toast.info(`DRS: ${on ? "ON" : "OFF"}`)} />
            <span className="text-sm text-[var(--mn-text-muted)]">DRS Toggle</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <MnSteppedRotary label="Brake Bias" positions={["54%", "56%", "58%", "60%", "62%"]} defaultValue={2}
              onChange={(i, label) => toast.info(`Brake Bias: ${label} (${i})`)} />
            <span className="text-sm text-[var(--mn-text-muted)]">Brake Bias</span>
          </div>
        </div>
      </ShowcaseCard>
    </ShowcaseSection>
  )
}
