"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* ── Context ─────────────────────────────────────────────── */

interface TabsContextValue {
  activeValue: string
  onSelect: (value: string) => void
  registerTab: (value: string) => void
  tabs: string[]
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs compound components must be used within <MnTabs>")
  return ctx
}

/* ── MnTabs (root) ───────────────────────────────────────── */

interface MnTabsProps extends React.ComponentProps<"div"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function MnTabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: MnTabsProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "")
  const [tabs, setTabs] = React.useState<string[]>([])

  const isControlled = value !== undefined
  const activeValue = isControlled ? value : internal

  const onSelect = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternal(v)
      onValueChange?.(v)
    },
    [isControlled, onValueChange],
  )

  const registerTab = React.useCallback((v: string) => {
    setTabs((prev) => prev.includes(v) ? prev : [...prev, v])
  }, [])

  const ctx = React.useMemo<TabsContextValue>(
    () => ({ activeValue, onSelect, registerTab, tabs }),
    [activeValue, onSelect, registerTab, tabs],
  )

  return (
    <TabsContext.Provider value={ctx}>
      <div data-slot="mn-tabs" className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

/* ── MnTabList ───────────────────────────────────────────── */

const tabListVariants = cva(
  "flex gap-0 border-b-2 border-border mb-4",
  {
    variants: {
      align: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
      },
    },
    defaultVariants: { align: "start" },
  },
)

interface MnTabListProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof tabListVariants> {}

function MnTabList({ className, align, children, ...props }: MnTabListProps) {
  const { tabs, onSelect, activeValue } = useTabsContext()
  const ref = React.useRef<HTMLDivElement>(null)

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.getAttribute("role") !== "tab") return

      const currentIdx = tabs.indexOf(activeValue)
      let nextIdx = currentIdx

      if (e.key === "ArrowRight") {
        nextIdx = (currentIdx + 1) % tabs.length
        e.preventDefault()
      } else if (e.key === "ArrowLeft") {
        nextIdx = (currentIdx - 1 + tabs.length) % tabs.length
        e.preventDefault()
      } else if (e.key === "Home") {
        nextIdx = 0
        e.preventDefault()
      } else if (e.key === "End") {
        nextIdx = tabs.length - 1
        e.preventDefault()
      } else {
        return
      }

      onSelect(tabs[nextIdx])
      const buttons = ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      buttons?.[nextIdx]?.focus()
    },
    [tabs, activeValue, onSelect],
  )

  return (
    <div
      ref={ref}
      role="tablist"
      data-slot="mn-tab-list"
      className={cn(tabListVariants({ align }), className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── MnTab (button) ──────────────────────────────────────── */

const tabVariants = cva(
  [
    "cursor-pointer border-b-2 border-transparent -mb-[2px] bg-transparent px-5 py-2.5",
    "text-sm text-muted-foreground transition-colors duration-150",
    "hover:text-foreground/70",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      active: {
        true: "border-b-primary text-foreground font-semibold",
        false: "",
      },
    },
    defaultVariants: { active: false },
  },
)

interface MnTabProps extends Omit<React.ComponentProps<"button">, "value"> {
  value: string
}

function MnTab({ value, className, children, ...props }: MnTabProps) {
  const { activeValue, onSelect, registerTab } = useTabsContext()
  const isActive = activeValue === value
  const panelId = `mn-tabpanel-${value}`
  const tabId = `mn-tab-${value}`

  React.useEffect(() => {
    registerTab(value)
  }, [value, registerTab])

  return (
    <button
      id={tabId}
      role="tab"
      type="button"
      data-slot="mn-tab"
      tabIndex={isActive ? 0 : -1}
      aria-selected={isActive}
      aria-controls={panelId}
      className={cn(tabVariants({ active: isActive }), className)}
      onClick={() => onSelect(value)}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── MnTabPanel ──────────────────────────────────────────── */

interface MnTabPanelProps extends React.ComponentProps<"div"> {
  value: string
}

function MnTabPanel({ value, className, children, ...props }: MnTabPanelProps) {
  const { activeValue } = useTabsContext()
  const isActive = activeValue === value
  const panelId = `mn-tabpanel-${value}`
  const tabId = `mn-tab-${value}`

  if (!isActive) return null

  return (
    <div
      id={panelId}
      role="tabpanel"
      data-slot="mn-tab-panel"
      tabIndex={0}
      aria-labelledby={tabId}
      className={cn("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { MnTabs, MnTabList, MnTab, MnTabPanel }
export type { MnTabsProps, MnTabListProps, MnTabProps, MnTabPanelProps }
