"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const formFieldVariants = cva("grid gap-1.5", {
  variants: {
    size: {
      default: "",
      sm: "gap-1",
      lg: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

// ---------------------------------------------------------------------------
// MnFormFieldLabel
// ---------------------------------------------------------------------------

interface MnFormFieldLabelProps extends React.ComponentProps<"label"> {
  required?: boolean
}

function MnFormFieldLabel({
  className,
  required,
  children,
  ...props
}: MnFormFieldLabelProps) {
  return (
    <label
      data-slot="form-field-label"
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

// ---------------------------------------------------------------------------
// MnFormFieldHint
// ---------------------------------------------------------------------------

function MnFormFieldHint({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-field-hint"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// MnFormFieldError
// ---------------------------------------------------------------------------

function MnFormFieldError({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  if (!children) return null

  return (
    <p
      data-slot="form-field-error"
      role="alert"
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
}

// ---------------------------------------------------------------------------
// MnFormField (root)
// ---------------------------------------------------------------------------

interface MnFormFieldProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof formFieldVariants> {
  /** Associates label via htmlFor and wires aria-describedby on the child control. */
  fieldId?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
}

function MnFormField({
  className,
  size,
  fieldId,
  label,
  hint,
  error,
  required,
  children,
  ...props
}: MnFormFieldProps) {
  const hintId = fieldId ? `${fieldId}-hint` : undefined
  const errorId = fieldId ? `${fieldId}-error` : undefined
  const hasError = Boolean(error)

  const describedBy = [hint ? hintId : undefined, hasError ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined

  // Clone the first child element to inject accessibility attributes
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (index !== 0 || !React.isValidElement(child)) return child

    const childProps: Record<string, unknown> = {}
    if (fieldId) childProps.id = fieldId
    if (describedBy) childProps["aria-describedby"] = describedBy
    if (hasError) childProps["aria-invalid"] = true

    return React.cloneElement(child, childProps)
  })

  return (
    <div
      data-slot="form-field"
      className={cn(formFieldVariants({ size, className }))}
      {...props}
    >
      {label && (
        <MnFormFieldLabel htmlFor={fieldId} required={required}>
          {label}
        </MnFormFieldLabel>
      )}

      {enhancedChildren}

      {hint && (
        <MnFormFieldHint id={hintId}>{hint}</MnFormFieldHint>
      )}

      {error && (
        <MnFormFieldError id={errorId}>{error}</MnFormFieldError>
      )}
    </div>
  )
}

export {
  MnFormField,
  MnFormFieldLabel,
  MnFormFieldHint,
  MnFormFieldError,
  formFieldVariants,
}
