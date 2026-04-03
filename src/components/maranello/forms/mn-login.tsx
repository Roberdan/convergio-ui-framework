"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, Lock, Mail, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

const loginVariants = cva(
  "mx-auto flex min-h-[540px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-background p-8",
  {
    variants: { size: { default: "max-w-sm", lg: "max-w-md" } },
    defaultVariants: { size: "default" },
  },
)

const statusDotVariants = cva("inline-block size-2 rounded-full", {
  variants: {
    status: {
      healthy: "bg-[var(--mn-success)]",
      degraded: "bg-[var(--mn-warning)]",
      unhealthy: "bg-[var(--mn-error)]",
    },
  },
  defaultVariants: { status: "healthy" },
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ServiceStatus = "healthy" | "degraded" | "unhealthy"

interface LoginServiceCheck { name: string; status: ServiceStatus }

interface SocialProvider { id: string; label: string; icon?: React.ReactNode }

interface MnLoginProps
  extends Omit<React.ComponentProps<"section">, "onSubmit">,
    VariantProps<typeof loginVariants> {
  title?: string
  titleAccent?: string
  subtitle?: string
  version?: string
  env?: string
  /** Error banner displayed above the form. */
  error?: string
  /** @default "Sign in" */
  submitLabel?: string
  forgotPasswordHref?: string
  onForgotPassword?: () => void
  onSubmit?: (email: string, password: string) => void
  socialProviders?: SocialProvider[]
  onSocialLogin?: (providerId: string) => void
  checks?: LoginServiceCheck[]
  loading?: boolean
}

// ---------------------------------------------------------------------------
// Shared classes (de-duplicated)
// ---------------------------------------------------------------------------

const ICON_CLS =
  "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
const INPUT_CLS =
  "h-10 w-full rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
const LINK_CLS =
  "text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

// ---------------------------------------------------------------------------
// MnLogin
// ---------------------------------------------------------------------------

function MnLogin({
  title, titleAccent, subtitle, version, env, error,
  submitLabel = "Sign in", forgotPasswordHref, onForgotPassword,
  onSubmit, socialProviders, onSocialLogin, checks,
  loading = false, size, className, ...props
}: MnLoginProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const formId = React.useId()
  const errorId = `${formId}-error`

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit?.(email, password)
  }

  const forgotLink = forgotPasswordHref || onForgotPassword

  return (
    <section
      aria-label="Sign in"
      data-slot="mn-login"
      className={cn(loginVariants({ size }), className)}
      {...props}
    >
      {(title || titleAccent) && (
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground" data-slot="mn-login-title">
          {title}
          {titleAccent && <span className="text-primary"> {titleAccent}</span>}
        </h1>
      )}
      {subtitle && (
        <p className="mb-6 text-sm text-muted-foreground" data-slot="mn-login-subtitle">{subtitle}</p>
      )}

      {error && (
        <div
          id={errorId} role="alert" data-slot="mn-login-error"
          className="mb-4 w-full rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4" aria-describedby={error ? errorId : undefined} noValidate>
        {/* Email */}
        <div className="grid gap-1.5">
          <label htmlFor={`${formId}-email`} className="text-sm font-medium text-foreground">Email</label>
          <div className="relative">
            <Mail className={ICON_CLS} aria-hidden="true" />
            <input
              id={`${formId}-email`} type="email" name="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className={cn(INPUT_CLS, "pl-10 pr-3")}
            />
          </div>
        </div>
        {/* Password */}
        <div className="grid gap-1.5">
          <label htmlFor={`${formId}-password`} className="text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <Lock className={ICON_CLS} aria-hidden="true" />
            <input
              id={`${formId}-password`} type={showPassword ? "text" : "password"} name="password"
              autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
              className={cn(INPUT_CLS, "pl-10 pr-10")}
            />
            <button
              type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword
                ? <EyeOff className="size-4" aria-hidden="true" />
                : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {forgotLink && (
          <div className="text-right">
            {onForgotPassword
              ? <button type="button" onClick={onForgotPassword} className={LINK_CLS}>Forgot password?</button>
              : <a href={forgotPasswordHref} className={LINK_CLS}>Forgot password?</a>}
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <LogIn className="size-4" aria-hidden="true" />
          {loading ? "Signing in\u2026" : submitLabel}
        </button>
      </form>

      {socialProviders && socialProviders.length > 0 && (
        <>
          <div className="my-4 flex w-full items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex w-full flex-col gap-2" data-slot="mn-login-social">
            {socialProviders.map((p) => (
              <button
                key={p.id} type="button" onClick={() => onSocialLogin?.(p.id)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >{p.icon}{p.label}</button>
            ))}
          </div>
        </>
      )}

      {checks && checks.length > 0 && (
        <div className="mt-6 w-full space-y-1 text-xs text-muted-foreground" data-slot="mn-login-status" role="status" aria-label="Service status">
          {checks.map((c) => (
            <div key={c.name} className="flex items-center justify-between">
              <span>{c.name}</span>
              <span className="inline-flex items-center gap-1.5">
                <span className={statusDotVariants({ status: c.status })} aria-hidden="true" />
                <span className="sr-only">{c.status}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {(version || env) && (
        <p className="mt-4 text-xs text-muted-foreground/60" data-slot="mn-login-footer">
          {version}{version && env && " \u00b7 "}{env}
        </p>
      )}
    </section>
  )
}

export { MnLogin, loginVariants, statusDotVariants }
export type { MnLoginProps, LoginServiceCheck, SocialProvider }
