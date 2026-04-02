"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Search, MoreHorizontal, UserPlus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Types ───────────────────────────────────────────────── */

export type UserRole = "admin" | "member" | "viewer" | "billing"
export type UserStatus = "active" | "inactive" | "suspended" | "invited"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastActive?: string
  avatarUrl?: string
  teams?: string[]
}

export type UserAction = "edit" | "suspend" | "delete" | "resend-invite"

export interface MnUserTableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  users: AdminUser[]
  searchable?: boolean
  selectable?: boolean
  loading?: boolean
  emptyMessage?: string
  onSelect?: (user: AdminUser) => void
  onAction?: (user: AdminUser, action: UserAction) => void
  onSelectionChange?: (selected: AdminUser[]) => void
}

/* ── CVA variants ────────────────────────────────────────── */

const statusBadge = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold leading-tight",
  {
    variants: {
      status: {
        active: "bg-[var(--mn-success-bg)] text-[var(--mn-success)]",
        inactive: "bg-[var(--mn-surface-raised)] text-[var(--mn-text-muted)]",
        suspended: "bg-[var(--mn-error-bg)] text-[var(--mn-error)]",
        invited: "bg-[var(--mn-info-bg)] text-[var(--mn-info)]",
      },
    },
    defaultVariants: { status: "active" },
  },
)

const roleBadge = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-tight",
  {
    variants: {
      role: {
        admin: "bg-[var(--mn-primary-bg)] text-[var(--mn-primary)]",
        member: "bg-[var(--mn-surface-raised)] text-[var(--mn-text)]",
        viewer: "bg-[var(--mn-surface-raised)] text-[var(--mn-text-muted)]",
        billing: "bg-[var(--mn-warning-bg)] text-[var(--mn-warning)]",
      },
    },
    defaultVariants: { role: "member" },
  },
)

/* ── Helpers ──────────────────────────────────────────────── */

const AVATAR_COLORS = 6

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function nameHash(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return Math.abs(h) % AVATAR_COLORS
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const thCls = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--mn-text-muted)]"
const tdCls = "px-3 py-2 text-sm text-[var(--mn-text)]"
const rowCls = "border-b border-[var(--mn-border)] transition-colors hover:bg-[var(--mn-surface-raised)]"

/* ── Component ───────────────────────────────────────────── */

function MnUserTable({
  users, searchable = true, selectable = true, loading = false,
  emptyMessage = "No users found", onSelect, onAction, onSelectionChange, className, ...rest
}: MnUserTableProps) {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const filtered = React.useMemo(() => {
    if (!query) return users
    const q = query.toLowerCase()
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, query])

  const notify = React.useCallback((s: Set<string>) => {
    onSelectionChange?.(users.filter((u) => s.has(u.id)))
  }, [users, onSelectionChange])

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      notify(next)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) => {
      const next = prev.size === filtered.length ? new Set<string>() : new Set(filtered.map((u) => u.id))
      notify(next)
      return next
    })
  }

  const onActivate = (e: React.KeyboardEvent, fn: () => void) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn() } }
  const colSpan = selectable ? 7 : 6

  function renderAvatar(user: AdminUser) {
    if (user.avatarUrl) {
      return (
        <img src={user.avatarUrl} alt={user.name}
          className="h-8 w-8 rounded-full object-cover" />
      )
    }
    const ci = nameHash(user.name)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mn-primary-bg)] text-xs font-semibold text-[var(--mn-primary)]"
        data-color={ci} aria-hidden="true">
        {getInitials(user.name)}
      </div>
    )
  }

  function renderTeams(teams?: string[]) {
    if (!teams || teams.length === 0) return <span className="text-[var(--mn-text-muted)]">&mdash;</span>
    const visible = teams.slice(0, 2); const overflow = teams.length - 2
    return (
      <span className="flex flex-wrap gap-1">
        {visible.map((t) => <span key={t} className="inline-flex rounded-full bg-[var(--mn-surface-raised)] px-2 py-0.5 text-xs text-[var(--mn-text)]">{t}</span>)}
        {overflow > 0 && <span className="inline-flex rounded-full bg-[var(--mn-surface-raised)] px-2 py-0.5 text-xs text-[var(--mn-text-muted)]">+{overflow}</span>}
      </span>
    )
  }

  function renderRow(user: AdminUser) {
    const isSel = selected.has(user.id)
    const act = () => onSelect?.(user)
    return (
      <tr key={user.id} role="row" aria-selected={selectable ? isSel : undefined}
        tabIndex={0} className={cn(rowCls, isSel && "bg-[var(--mn-primary-bg)]")}
        onClick={act} onKeyDown={(e) => onActivate(e, act)}>
        {selectable && (
          <td className="w-10 px-2 text-center">
            <input type="checkbox" checked={isSel} aria-label={`Select ${user.name}`}
              onChange={() => toggleOne(user.id)} onClick={(e) => e.stopPropagation()} />
          </td>
        )}
        <td className={tdCls}>
          <div className="flex items-center gap-3">
            {renderAvatar(user)}
            <div className="min-w-0">
              <div className="truncate font-medium text-[var(--mn-text)]">{user.name}</div>
              <div className="truncate text-xs text-[var(--mn-text-muted)]">{user.email}</div>
            </div>
          </div>
        </td>
        <td className={tdCls}><span className={statusBadge({ status: user.status })}>{capitalize(user.status)}</span></td>
        <td className={tdCls}><span className={roleBadge({ role: user.role })}>{capitalize(user.role)}</span></td>
        <td className={tdCls}>{renderTeams(user.teams)}</td>
        <td className={cn(tdCls, "text-[var(--mn-text-muted)]")}>{user.lastActive ?? "\u2014"}</td>
        <td className={cn(tdCls, "text-right")}>
          <div className="flex items-center justify-end gap-1">
            <button type="button" aria-label={`More actions for ${user.name}`}
              className="rounded p-1 text-[var(--mn-text-muted)] hover:bg-[var(--mn-surface-raised)] hover:text-[var(--mn-text)]"
              onClick={(e) => { e.stopPropagation(); onAction?.(user, "edit") }}>
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label={`Delete ${user.name}`}
              className="rounded p-1 text-[var(--mn-text-muted)] hover:bg-[var(--mn-error-bg)] hover:text-[var(--mn-error)]"
              onClick={(e) => { e.stopPropagation(); onAction?.(user, "delete") }}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  function renderBody() {
    if (loading) return <tr><td colSpan={colSpan} className="py-8 text-center text-[var(--mn-text-muted)]">Loading&#8230;</td></tr>
    if (filtered.length === 0) return <tr><td colSpan={colSpan} className="py-8 text-center text-[var(--mn-text-muted)]">{emptyMessage}</td></tr>
    return filtered.map(renderRow)
  }

  return (
    <div className={cn("w-full overflow-auto rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)]", className)} {...rest}>
      {searchable && (
        <div className="flex items-center gap-2 border-b border-[var(--mn-border)] px-3 py-2">
          <Search className="h-4 w-4 text-[var(--mn-text-muted)]" aria-hidden="true" />
          <input type="search" placeholder="Search users\u2026" aria-label="Search users"
            className="flex-1 bg-transparent text-sm text-[var(--mn-text)] placeholder:text-[var(--mn-text-muted)] outline-none"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <span className="text-xs text-[var(--mn-text-muted)]">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      )}
      <table role="grid" aria-label={rest["aria-label"] ?? "User table"} className="w-full border-collapse text-sm">
        <thead>
          <tr role="row">
            {selectable && (
              <th role="columnheader" className="w-10 px-2 py-2 text-center">
                <input type="checkbox" aria-label="Select all users"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll} />
              </th>
            )}
            <th role="columnheader" scope="col" className={thCls}>User</th>
            <th role="columnheader" scope="col" className={thCls}>Status</th>
            <th role="columnheader" scope="col" className={thCls}>Role</th>
            <th role="columnheader" scope="col" className={thCls}>Teams</th>
            <th role="columnheader" scope="col" className={thCls}>Last active</th>
            <th role="columnheader" scope="col" className={cn(thCls, "text-right")}><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody role="rowgroup">{renderBody()}</tbody>
      </table>
      <div role="status" aria-live="polite" className="sr-only">
        {filtered.length} of {users.length} users
      </div>
    </div>
  )
}

export { MnUserTable }
