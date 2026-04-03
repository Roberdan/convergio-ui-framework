"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVoiceInput, type VoiceState } from "./mn-voice-input.helpers"

export { useVoiceInput } from "./mn-voice-input.helpers"
export type { VoiceState, UseVoiceInputOptions, UseVoiceInputReturn } from "./mn-voice-input.helpers"

/* CVA variants */
const voiceButtonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-full",
    "border border-[var(--mn-border)]",
    "transition-all duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-accent)]",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-9 w-9",
        md: "h-11 w-11",
        lg: "h-14 w-14",
      },
      active: {
        true: "bg-[var(--mn-error)] border-[var(--mn-error)] text-[var(--mn-danger-text)] shadow-[0_0_12px_var(--mn-error)]",
        false: "bg-[var(--mn-surface-raised)] text-[var(--mn-text-muted)] hover:bg-[var(--mn-hover-bg)]",
      },
    },
    defaultVariants: { size: "md", active: false },
  },
)

const ICON_SIZE: Record<string, string> = { sm: "size-4", md: "size-5", lg: "size-6" }

/* Waveform indicator */
function WaveformIndicator({ active, className }: { active: boolean; className?: string }) {
  return (
    <div
      className={cn("flex items-end justify-center gap-0.5", className)}
      aria-hidden="true"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-0.5 rounded-full bg-[var(--mn-accent)] transition-all duration-150",
            active ? "animate-pulse" : "h-1",
          )}
          style={
            active
              ? {
                  height: `${8 + Math.sin(i * 1.2) * 6}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: `${400 + i * 80}ms`,
                }
              : undefined
          }
        />
      ))}
    </div>
  )
}

/* Props */
interface MnVoiceInputProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof voiceButtonVariants> {
  locale?: string
  continuous?: boolean
  showWaveform?: boolean
  onStateChange?: (state: VoiceState) => void
  onTranscript?: (text: string, isFinal: boolean) => void
  onVoiceError?: (error: Error) => void
}

/* Component */
function MnVoiceInput({
  size = "md",
  locale,
  continuous,
  showWaveform = true,
  onStateChange,
  onTranscript,
  onVoiceError,
  className,
  ...props
}: MnVoiceInputProps) {
  const { state, isSupported, toggle } = useVoiceInput({
    locale,
    continuous,
    onStateChange,
    onTranscript,
    onError: onVoiceError,
  })

  const isListening = state === "listening"
  const isProcessing = state === "processing"
  const isError = state === "error"
  const iconClass = ICON_SIZE[size ?? "md"]

  const label = isListening
    ? "Stop listening"
    : isProcessing
      ? "Processing speech"
      : isError
        ? "Voice input error, click to retry"
        : "Start voice input"

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label={label}
        aria-pressed={isListening}
        disabled={!isSupported || props.disabled}
        onClick={toggle}
        {...props}
        className={cn(voiceButtonVariants({ size, active: isListening }), className)}
      >
        {isListening && <Square className={iconClass} />}
        {isProcessing && <Loader2 className={cn(iconClass, "animate-spin")} />}
        {isError && <AlertCircle className={iconClass} />}
        {state === "idle" && <Mic className={iconClass} />}
      </button>
      {showWaveform && <WaveformIndicator active={isListening} />}
    </div>
  )
}

export { MnVoiceInput, voiceButtonVariants, WaveformIndicator }
export type { MnVoiceInputProps }
