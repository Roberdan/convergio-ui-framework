"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Menu, X, ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────── */

export interface AdminShellNavItem {
  id: string; label: string; icon?: React.ReactNode
  section?: string; badge?: string | number
}

export interface AdminShellBreadcrumb { label: string; href?: string }

export interface MnAdminShellProps extends React.ComponentProps<"div"> {
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  sidebarHeader?: React.ReactNode
  sidebarFooter?: React.ReactNode
  nav?: AdminShellNavItem[]
  activeNavId?: string
  onNavigate?: (id: string) => void
  topBar?: boolean
  breadcrumbs?: AdminShellBreadcrumb[]
  pageTitle?: string
  contentId?: string
}

/* ── CVA variants ──────────────────────────────────────── */

const shellVariants = cva(
  "mn-admin-shell relative grid h-screen w-full overflow-hidden bg-[var(--mn-surface)] text-[var(--mn-text)] font-[var(--mn-font-body,var(--font-body,sans-serif))] transition-[grid-template-columns] duration-200",
  {
    variants: {
      collapsed: { true: "grid-cols-[3.5rem_1fr]", false: "grid-cols-[16rem_1fr]" },
    },
    defaultVariants: { collapsed: false },
  },
)

const sidebarVariants = cva(
  "mn-admin-sidebar flex flex-col h-full overflow-y-auto bg-[var(--mn-surface-sunken)] border-r border-[var(--mn-border)] transition-[width] duration-200",
)

const navItemVariants = cva(
  "mn-admin-nav-item group flex items-center gap-2 w-full rounded-md px-2.5 py-2 text-sm text-[var(--mn-text-secondary)] cursor-pointer transition-colors duration-150 hover:bg-[var(--mn-hover-bg)] hover:text-[var(--mn-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)] focus-visible:ring-offset-1",
  {
    variants: {
      active: { true: "bg-[var(--mn-accent-bg)] text-[var(--mn-accent)] font-medium", false: "" },
    },
    defaultVariants: { active: false },
  },
)

const topbarVariants = cva(
  "mn-admin-topbar flex items-center gap-2 px-6 h-12 border-b border-[var(--mn-border)] bg-[var(--mn-surface)] text-sm text-[var(--mn-text-secondary)]",
)

/* ── Sub-components ────────────────────────────────────── */

function NavSection({ title, collapsed }: { title: string; collapsed: boolean }) {
  if (collapsed) return <hr className="mx-2 my-1.5 border-[var(--mn-border-subtle)]" />
  return (
    <span className="px-3 pt-4 pb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--mn-text-tertiary)]">
      {title}
    </span>
  )
}

function NavItem({ item, active, collapsed, onNavigate }: {
  item: AdminShellNavItem; active: boolean; collapsed: boolean; onNavigate: (id: string) => void
}) {
  return (
    <button
      type="button"
      className={cn(navItemVariants({ active }), collapsed && "justify-center px-0")}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      onClick={() => onNavigate(item.id)}
    >
      <span className="flex-shrink-0 [&_svg]:size-4" aria-hidden="true">
        {item.icon ?? <Home className="size-4" />}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {item.badge != null && (
            <span className="ml-auto rounded-full bg-[var(--mn-accent-bg)] px-1.5 py-0.5 text-[0.65rem] font-medium text-[var(--mn-accent)]">
              {item.badge}
            </span>
          )}
        </>
      )}
    </button>
  )
}

function Topbar({ breadcrumbs, pageTitle }: { breadcrumbs?: AdminShellBreadcrumb[]; pageTitle?: string }) {
  const crumbs = breadcrumbs ?? [{ label: "Admin" }]
  return (
    <div className={topbarVariants()}>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={`bc-${i}`}>
          {i > 0 && <ChevronRight className="size-3.5 text-[var(--mn-text-tertiary)]" aria-hidden="true" />}
          {crumb.href ? (
            <a href={crumb.href} className="hover:text-[var(--mn-accent)] transition-colors">{crumb.label}</a>
          ) : (
            <span>{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
      {pageTitle && (
        <>
          <ChevronRight className="size-3.5 text-[var(--mn-text-tertiary)]" aria-hidden="true" />
          <span className="font-medium text-[var(--mn-text)]">{pageTitle}</span>
        </>
      )}
    </div>
  )
}

/* ── Component ─────────────────────────────────────────── */

/** `MnAdminShell` — full-page admin layout with collapsible sidebar, header, breadcrumbs, and content area. */
export function MnAdminShell({
  collapsed: controlledCollapsed, defaultCollapsed = false, onCollapsedChange,
  sidebarHeader, sidebarFooter, nav = [], activeNavId, onNavigate,
  topBar = true, breadcrumbs, pageTitle, contentId = "main-content",
  className, children, ...props
}: MnAdminShellProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed)
  const isCollapsed = controlledCollapsed ?? internalCollapsed

  const handleToggle = React.useCallback(() => {
    const next = !isCollapsed
    setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }, [isCollapsed, onCollapsedChange])

  const handleNavigate = React.useCallback(
    (id: string) => { onNavigate?.(id) },
    [onNavigate],
  )

  const grouped = React.useMemo(() => {
    const map = new Map<string, AdminShellNavItem[]>()
    for (const item of nav) {
      const key = item.section ?? ""
      const arr = map.get(key)
      if (arr) arr.push(item)
      else map.set(key, [item])
    }
    return map
  }, [nav])

  return (
    <div className={cn(shellVariants({ collapsed: isCollapsed }), className)} {...props}>
      <a
        href={`#${contentId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-[var(--mn-accent)] focus:px-4 focus:py-2 focus:text-[var(--mn-text-on-accent)]"
      >
        Skip to content
      </a>

      <nav className={sidebarVariants()} role="navigation" aria-label="Admin navigation">
        <div className={cn("flex items-center gap-2 px-3 h-12 border-b border-[var(--mn-border)]", isCollapsed && "justify-center px-0")}>
          {!isCollapsed && sidebarHeader}
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1.5",
              "text-[var(--mn-text-secondary)] hover:bg-[var(--mn-hover-bg)] hover:text-[var(--mn-text)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-accent)]",
              "transition-colors duration-150",
              !isCollapsed && "ml-auto",
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={handleToggle}
          >
            {isCollapsed ? <Menu className="size-4" /> : <X className="size-4" />}
          </button>
        </div>

        <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto px-2 py-2">
          {Array.from(grouped.entries()).map(([section, items]) => (
            <React.Fragment key={section || "__default"}>
              {section && <NavSection title={section} collapsed={isCollapsed} />}
              {items.map((item) => (
                <NavItem key={item.id} item={item} active={item.id === activeNavId} collapsed={isCollapsed} onNavigate={handleNavigate} />
              ))}
            </React.Fragment>
          ))}
        </div>

        {sidebarFooter && (
          <div className={cn("border-t border-[var(--mn-border)] px-3 py-2", isCollapsed && "px-1")}>
            {sidebarFooter}
          </div>
        )}
      </nav>

      <div className="flex flex-col h-full overflow-hidden">
        {topBar && <Topbar breadcrumbs={breadcrumbs} pageTitle={pageTitle} />}
        <main id={contentId} className="mn-admin-content flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export { shellVariants, sidebarVariants, navItemVariants, topbarVariants }
