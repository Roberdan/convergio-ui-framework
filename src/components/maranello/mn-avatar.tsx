"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* ── Variant definitions ── */

const avatarVariants = cva(
  [
    "relative inline-flex items-center justify-center",
    "rounded-full overflow-hidden",
    "border-2 border-[var(--mn-border)]",
    "bg-[linear-gradient(135deg,var(--mn-surface-raised),var(--mn-surface-sunken))]",
    "text-[var(--mn-text-muted)] font-[var(--font-display)] font-semibold uppercase",
    "shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_var(--mn-hover-bg)]",
    "select-none shrink-0",
  ],
  {
    variants: {
      size: {
        sm: "size-7 text-[0.625rem]",
        md: "size-10 text-xs",
        lg: "size-14 text-sm",
        xl: "size-20 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
)

const statusVariants = cva(
  [
    "absolute bottom-0 right-0 rounded-full",
    "border-2 border-[var(--mn-surface-raised)]",
  ],
  {
    variants: {
      size: {
        sm: "size-2",
        md: "size-2.5",
        lg: "size-3",
        xl: "size-4",
      },
      status: {
        online: "bg-[var(--status-active)]",
        busy: "bg-[var(--mn-error)]",
        away: "bg-[var(--status-warning)]",
        offline: "bg-[var(--mn-text-muted)]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
)

/* ── Types ── */

type AvatarStatus = "online" | "busy" | "away" | "offline"

interface MnAvatarProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof avatarVariants> {
  /** URL for the avatar image */
  src?: string
  /** Alt text for image (required when src is provided) */
  alt?: string
  /** Initials to display when no image is provided (1-2 chars) */
  initials?: string
  /** Online status indicator */
  status?: AvatarStatus
}

/* ── Helpers ── */

function getStatusLabel(status: AvatarStatus): string {
  const labels: Record<AvatarStatus, string> = {
    online: "Online",
    busy: "Busy",
    away: "Away",
    offline: "Offline",
  }
  return labels[status]
}

/* ── Component ── */

function MnAvatar({
  className,
  size = "md",
  src,
  alt = "",
  initials,
  status,
  ...props
}: MnAvatarProps) {
  const [imgError, setImgError] = React.useState(false)

  // Reset error state when src changes
  React.useEffect(() => {
    setImgError(false)
  }, [src])

  const showImage = src && !imgError
  const displayInitials = initials?.slice(0, 2).toUpperCase()

  return (
    <span
      role="img"
      aria-label={alt || displayInitials || "Avatar"}
      data-slot="mn-avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="size-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{displayInitials}</span>
      )}

      {status && (
        <span
          aria-label={getStatusLabel(status)}
          className={cn(statusVariants({ size, status }))}
        />
      )}
    </span>
  )
}

/* ── Avatar Group ── */

interface MnAvatarGroupProps extends React.ComponentProps<"div"> {
  /** Maximum avatars to display before showing +N overflow */
  max?: number
}

function MnAvatarGroup({
  className,
  max,
  children,
  ...props
}: MnAvatarGroupProps) {
  const childArray = React.Children.toArray(children)
  const visible = max ? childArray.slice(0, max) : childArray
  const overflow = max ? childArray.length - max : 0

  return (
    <div
      role="group"
      aria-label="Avatar group"
      data-slot="mn-avatar-group"
      className={cn("flex -space-x-2", className)}
      {...props}
    >
      {visible.map((child, i) => (
        <span key={i} className="ring-2 ring-[var(--mn-surface)] rounded-full">
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span
          aria-label={`${overflow} more`}
          className={cn(
            avatarVariants({ size: "md" }),
            "ring-2 ring-[var(--mn-surface)] text-[0.625rem]",
          )}
        >
          <span aria-hidden="true">+{overflow}</span>
        </span>
      )}
    </div>
  )
}

export { MnAvatar, MnAvatarGroup, avatarVariants, statusVariants }
export type { MnAvatarProps, MnAvatarGroupProps, AvatarStatus }
