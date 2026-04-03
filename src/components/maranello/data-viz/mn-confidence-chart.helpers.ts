/* ── Helpers ───────────────────────────────────────────────── */

function resolveCssVar(name: string): string {
  if (typeof document === "undefined") return "#888"
  const el = document.body ?? document.documentElement
  return getComputedStyle(el).getPropertyValue(name).trim() || "#888"
}

export function parseColor(color: string): string {
  if (color.startsWith("var(")) {
    const name = color.slice(4, color.indexOf(")")).split(",")[0].trim()
    return resolveCssVar(name)
  }
  if (color.startsWith("--")) return resolveCssVar(color)
  return color
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace("#", "")
  if (clean.length !== 6 && clean.length !== 3) return null
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function colorWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(128,128,128,${alpha})`
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

/* ── Draw pipeline ─────────────────────────────────────────── */

export interface DrawOpts {
  labels: string[]
  values: number[]
  lower: number[]
  upper: number[]
  unit: string
  lineColor: string
  showDots: boolean
  height: number
}

export function render(
  cvs: HTMLCanvasElement,
  w: number,
  opts: DrawOpts,
  progress: number,
) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const logicalH = opts.height
  const n = opts.labels.length

  cvs.width = Math.round(w * dpr)
  cvs.height = Math.round(logicalH * dpr)
  cvs.style.width = `${w}px`
  cvs.style.height = `${logicalH}px`

  const ctx = cvs.getContext("2d")
  if (!ctx || n === 0) return
  if (w < 40 || logicalH < 40) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, logicalH)

  const lineHex = parseColor(opts.lineColor)
  const borderHex = parseColor("var(--mn-border)")
  const mutedHex = parseColor("var(--mn-text-muted)")

  const dataMin = Math.min(...opts.lower)
  const dataMax = Math.max(...opts.upper)
  const rangePad = (dataMax - dataMin) * 0.1 || 1
  const yMin = dataMin - rangePad
  const yMax = dataMax + rangePad

  const pad = { top: 16, bottom: 40, left: 48, right: 12 }
  const chartW = w - pad.left - pad.right
  const chartH = logicalH - pad.top - pad.bottom

  const xAt = (i: number) =>
    pad.left + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2)
  const yAt = (v: number) =>
    pad.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH

  const visible = Math.min(Math.ceil(1 + progress * (n - 1)), n)

  // Y gridlines
  const gridRows = 4
  ctx.strokeStyle = colorWithAlpha(
    borderHex.startsWith("#") ? borderHex : "#888888",
    0.5,
  )
  ctx.lineWidth = 0.5
  ctx.font = "10px system-ui, sans-serif"
  ctx.fillStyle = mutedHex
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  for (let r = 0; r <= gridRows; r++) {
    const val = yMin + (r / gridRows) * (yMax - yMin)
    const y = yAt(val)
    ctx.beginPath()
    ctx.moveTo(pad.left, y)
    ctx.lineTo(w - pad.right, y)
    ctx.stroke()
    ctx.fillText(val.toFixed(1), pad.left - 6, y)
  }

  if (visible < 1) return

  // Confidence band
  ctx.beginPath()
  for (let i = 0; i < visible; i++) ctx.lineTo(xAt(i), yAt(opts.upper[i]))
  for (let i = visible - 1; i >= 0; i--) ctx.lineTo(xAt(i), yAt(opts.lower[i]))
  ctx.closePath()
  ctx.fillStyle = colorWithAlpha(
    lineHex.startsWith("#") ? lineHex : "#FFC72C",
    0.15,
  )
  ctx.fill()

  // Median line
  ctx.beginPath()
  for (let i = 0; i < visible; i++) {
    const x = xAt(i)
    const y = yAt(opts.values[i])
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = lineHex
  ctx.lineWidth = 2
  ctx.lineJoin = "round"
  ctx.stroke()

  // Data point dots
  if (opts.showDots) {
    for (let i = 0; i < visible; i++) {
      ctx.beginPath()
      ctx.arc(xAt(i), yAt(opts.values[i]), 4, 0, Math.PI * 2)
      ctx.fillStyle = lineHex
      ctx.fill()
    }
  }

  // X labels
  ctx.font = "10px system-ui, sans-serif"
  ctx.fillStyle = mutedHex
  ctx.textBaseline = "top"
  const rotateLabels = n > 6
  for (let i = 0; i < visible; i++) {
    const x = xAt(i)
    const y = logicalH - pad.bottom + 8
    if (rotateLabels) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-Math.PI / 6)
      ctx.textAlign = "right"
      ctx.fillText(opts.labels[i], 0, 0)
      ctx.restore()
    } else {
      ctx.textAlign = "center"
      ctx.fillText(opts.labels[i], x, y)
    }
  }
}
