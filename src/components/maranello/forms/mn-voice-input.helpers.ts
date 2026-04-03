import * as React from "react"

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
export type VoiceState = "idle" | "listening" | "processing" | "error"
export interface UseVoiceInputOptions {
  locale?: string; continuous?: boolean; interimResults?: boolean
  onStateChange?: (state: VoiceState) => void
  onTranscript?: (text: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}
export interface UseVoiceInputReturn {
  state: VoiceState; transcript: string; interimTranscript: string
  isSupported: boolean; start: () => void; stop: () => void; toggle: () => void
}

/* Hook */
export function useVoiceInput(opts: UseVoiceInputOptions = {}): UseVoiceInputReturn {
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
