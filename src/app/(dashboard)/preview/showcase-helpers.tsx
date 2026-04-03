"use client"

import type { ChatMessage, KanbanCard } from "@/components/maranello"

export const btn =
  "px-4 py-2 rounded-md bg-[var(--mn-accent)] text-[var(--mn-accent-text)] font-medium hover:bg-[var(--mn-accent-hover)] transition-colors"

export const sampleTableData = [
  { id: "1", name: "Ferrari SF-24", team: "Scuderia Ferrari", points: 450 },
  { id: "2", name: "Red Bull RB20", team: "Red Bull Racing", points: 520 },
  { id: "3", name: "McLaren MCL38", team: "McLaren F1", points: 380 },
  { id: "4", name: "Mercedes W15", team: "Mercedes-AMG", points: 310 },
  { id: "5", name: "Aston Martin AMR24", team: "Aston Martin", points: 260 },
]

export const initialMessages: ChatMessage[] = [
  { id: "1", role: "user", content: "What's our conversion rate this week?", timestamp: new Date("2026-04-01T10:00:00Z") },
  { id: "2", role: "assistant", content: "Your conversion rate is **3.2%** this week, up from 2.8% last week. The main driver was the new landing page variant B which showed a `+15%` lift in signups.", timestamp: new Date("2026-04-01T10:01:00Z") },
  { id: "3", role: "user", content: "Which channel performs best?", timestamp: new Date("2026-04-01T10:02:00Z") },
  { id: "4", role: "assistant", content: "Organic search leads with **42%** of total conversions, followed by direct traffic at **28%**. Social media contributes **18%** — up 3pp from last month.", timestamp: new Date("2026-04-01T10:03:00Z") },
]

export const initialKanbanCards: KanbanCard[] = [
  { id: "k1", columnId: "backlog", title: "Research competitor pricing", description: "Analyze top 5 competitors", priority: "low" },
  { id: "k2", columnId: "todo", title: "Design onboarding flow", description: "Create wireframes for new user onboarding", priority: "high", tags: ["design", "ux"] },
  { id: "k3", columnId: "doing", title: "Implement auth module", description: "JWT + OAuth2 integration", assignee: "RD", priority: "critical", tags: ["backend"] },
  { id: "k4", columnId: "doing", title: "Build dashboard widgets", description: "KPI cards and charts", assignee: "MR", priority: "medium", tags: ["frontend"] },
  { id: "k5", columnId: "done", title: "Set up CI/CD pipeline", description: "GitHub Actions + Docker", priority: "high", tags: ["devops"] },
  { id: "k6", columnId: "todo", title: "Write API documentation", description: "OpenAPI 3.1 spec for all endpoints", priority: "medium", tags: ["docs"] },
]

export async function searchTechnologies(query: string) {
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

export function ShowcaseSection({ id, title, description, children }: {
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

export function ShowcaseCard({ title, children, className }: {
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
