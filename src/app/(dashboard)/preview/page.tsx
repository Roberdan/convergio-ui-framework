"use client"

import { MnBreadcrumb, MnToast, MnA11y } from "@/components/maranello"
import { PreviewW1 } from "./preview-w1"
import { PreviewW2 } from "./preview-w2"
import { PreviewW3 } from "./preview-w3"
import { PreviewW4 } from "./preview-w4"

export default function MaranelloShowcase() {
  return (
    <div className="min-h-screen bg-[var(--mn-surface)] text-[var(--mn-text)] p-4 lg:p-8 space-y-10 w-full">
      <header className="space-y-2 w-full">
        <h1 className="text-3xl font-bold tracking-tight">
          Maranello Design System — Component Showcase
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

      <PreviewW1 />
      <PreviewW2 />
      <PreviewW3 />
      <PreviewW4 />

      <MnToast />
      <MnA11y />
    </div>
  )
}
