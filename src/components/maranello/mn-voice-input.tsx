"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Mic, Square, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/* Web Speech API ambient types */
interface SpeechRecogEvent extends Event { readonly results: SpeechRecognitionResultList }
interface SpeechRecogErrorEvent extends Event { readonly error: string }
interface SpeechRecog extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean
  onstart: (() => void) | null; onend: (() => void) | null
  onerror: ((ev: SpeechRecogErrorEvent) => void) | null
  onresult: ((ev: SpeechRecogEvent) => void) | null
  start(): void; stop(): void; abort(): void
}
type SpeechRecogCtor = new () => SpeechRecog

/* Types */
type VoiceState = "idle" | "listening" | "processing" | "error"
interface UseVoiceInputOptions {
  locale?: string; continuous?: boolean; interimResults?: boolean
  onStateChange?: (state: VoiceState) => void
  onTranscript?: (text: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}
interface UseVoiceInputReturn {
  state: VoiceState; transcript: string; interimTranscript: string
  isSupported: boolean; start: () => void; stop: () => void; toggle: () => void
}

/* Hook */

function useVoiceInput(opts: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    locale,
    continuous = true,
    interimResults = true,
    onStateChange,
    onTranscript,
    onError,
  } = opts

  const [state, setState] = React.useState<VoiceState>("idle")
  const [transcript, setTranscript] = React.useState("")
  const [interimTranscript, setInterimTranscript] = React.useState("")
  const recognitionRef = React.useRef<SpeechRecog | null>(null)
  const recoveryRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [isSupported, setIsSupported] = React.useState(false)

  React.useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    )
  }, [])

  const changeState = React.useCallback(
    (next: VoiceState) => {
      setState(next)
      onStateChange?.(next)
    },
    [onStateChange],
  )

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = React.useCallback(() => {
    if (!isSupported) return
    const w = window as unknown as Record<string, unknown>
    const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SpeechRecogCtor
    const rec = new Ctor()
    rec.lang = locale ?? navigator.language ?? "en-US"
    rec.continuous = continuous
    rec.interimResults = interimResults

    rec.onstart = () => changeState("listening")
    rec.onend = () => changeState("idle")
    rec.onerror = (ev) => {
      const err = new Error(ev.error)
      onError?.(err)
      changeState("error")
      clearTimeout(recoveryRef.current)
      recoveryRef.current = setTimeout(() => changeState("idle"), 3000)
    }
    rec.onresult = (ev) => {
      let final = ""
      let interim = ""
      for (let i = 0; i < ev.results.length; i++) {
        const result = ev.results[i]
        if (!result) continue
        const text = result[0]?.transcript ?? ""
        if (result.isFinal) {
          final += text
        } else {
          interim += text
        }
      }
      if (final) {
        setTranscript((prev) => prev + final)
        onTranscript?.(final, true)
      }
      setInterimTranscript(interim)
      if (interim) onTranscript?.(interim, false)
    }

    recognitionRef.current = rec
    changeState("listening")
    rec.start()
  }, [isSupported, locale, continuous, interimResults, changeState, onError, onTranscript])

  const toggle = React.useCallback(() => {
    if (state === "listening") stop()
    else start()
  }, [state, start, stop])

  React.useEffect(() => () => {
    recognitionRef.current?.abort()
    clearTimeout(recoveryRef.current)
  }, [])

  return { state, transcript, interimTranscript, isSupported, start, stop, toggle }
}

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

export { MnVoiceInput, useVoiceInput, voiceButtonVariants, WaveformIndicator }
export type { MnVoiceInputProps, VoiceState, UseVoiceInputOptions, UseVoiceInputReturn }
