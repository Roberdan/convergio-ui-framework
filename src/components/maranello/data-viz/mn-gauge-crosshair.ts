/**
 * Crosshair grid and multigraph mini-chart complications for MnGauge.
 * Ported from convergio-design gauge-engine-complications.ts.
 */
import type { GaugePalette } from './mn-gauge.helpers'

export interface CrosshairScatterDot {
  x: number; y: number; color: string; r?: number
}

export interface Crosshair {
  x: number; y: number; dotColor?: string; gridColor?: string
  labelTop?: string; labelBottom?: string; labelLeft?: string; labelRight?: string
  title?: string; scatterDots?: CrosshairScatterDot[]
}

export interface QuadrantCounts {
  tl: number | string; tr: number | string
  bl: number | string; br: number | string
}

export interface Multigraph {
  data: number[]; color: string; label?: string
}

/* ── Helpers ────────────────────────────────────────────────── */

function circ(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2)
}

/* ── Crosshair ─────────────────────────────────────────────── */

export function drawCrosshair(
  ctx: CanvasRenderingContext2D, ch: Crosshair,
  cx: number, cy: number, radius: number, size: number,
  progress: number, P: GaugePalette, qc?: QuadrantCounts,
): void {
  const gridR = radius * 0.78
  const gridCol = ch.gridColor ?? '#5a4a20'

  ctx.strokeStyle = gridCol; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.85
  ctx.beginPath(); ctx.moveTo(cx - gridR, cy); ctx.lineTo(cx + gridR, cy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx, cy - gridR); ctx.lineTo(cx, cy + gridR); ctx.stroke()
  ctx.globalAlpha = 0.25
  for (let i = 1; i <= 4; i++) {
    const d = gridR * i / 4
    ctx.beginPath(); ctx.moveTo(cx - gridR, cy - d); ctx.lineTo(cx + gridR, cy - d); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx - gridR, cy + d); ctx.lineTo(cx + gridR, cy + d); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx - d, cy - gridR); ctx.lineTo(cx - d, cy + gridR); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + d, cy - gridR); ctx.lineTo(cx + d, cy + gridR); ctx.stroke()
  }
  ctx.globalAlpha = 1.0

  // Axis labels
  const lfs = Math.max(6, size * 0.035)
  ctx.font = `600 ${lfs}px 'Barlow Condensed','Outfit',sans-serif`
  ctx.fillStyle = P.axisLabel; ctx.textAlign = 'center'
  if (ch.labelTop) { ctx.textBaseline = 'bottom'; ctx.fillText(ch.labelTop, cx, cy - gridR - 4) }
  if (ch.labelBottom) { ctx.textBaseline = 'top'; ctx.fillText(ch.labelBottom, cx, cy + gridR + 4) }
  if (ch.labelLeft) { ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(ch.labelLeft, cx - gridR - 4, cy) }
  if (ch.labelRight) { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(ch.labelRight, cx + gridR + 4, cy) }
  if (ch.title) {
    ctx.font = `600 ${Math.max(6, size * 0.04)}px 'Barlow Condensed','Outfit',sans-serif`
    ctx.fillStyle = P.axisLabel; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText(ch.title, cx, cy - gridR - lfs - 6)
  }

  // Crosshair dot
  const dotCol = ch.dotColor ?? P.accent
  const dotX = cx + ch.x * gridR * progress
  const dotY = cy + ch.y * gridR * progress
  ctx.setLineDash([3, 3]); ctx.strokeStyle = dotCol; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5
  ctx.beginPath(); ctx.moveTo(cx - gridR, dotY); ctx.lineTo(cx + gridR, dotY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(dotX, cy - gridR); ctx.lineTo(dotX, cy + gridR); ctx.stroke()
  ctx.setLineDash([]); ctx.globalAlpha = 1.0
  ctx.save(); ctx.shadowColor = dotCol; ctx.shadowBlur = 10
  circ(ctx, dotX, dotY, 5); ctx.fillStyle = dotCol; ctx.fill(); ctx.restore()
  circ(ctx, dotX, dotY, 2); ctx.fillStyle = '#fff'; ctx.fill()

  // Scatter dots
  if (ch.scatterDots) {
    for (const sd of ch.scatterDots) {
      const sdx = cx + sd.x * gridR * progress
      const sdy = cy + sd.y * gridR * progress
      const sdR = sd.r ?? 3
      ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * progress
      ctx.shadowColor = sd.color; ctx.shadowBlur = sdR * 2
      circ(ctx, sdx, sdy, sdR); ctx.fillStyle = sd.color; ctx.fill(); ctx.restore()
      circ(ctx, sdx, sdy, sdR * 0.4); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill()
    }
  }

  // Quadrant counts
  if (qc) {
    const qfs = Math.max(8, size * 0.05)
    const off = gridR * 0.5
    ctx.font = `700 ${qfs}px 'Barlow Condensed','Outfit',sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = 0.25
    ctx.fillStyle = P.axisLabel; ctx.fillText(String(qc.tl), cx - off, cy - off)
    ctx.fillStyle = P.accent; ctx.fillText(String(qc.tr), cx + off, cy - off)
    ctx.fillStyle = P.muted; ctx.fillText(String(qc.bl), cx - off, cy + off)
    ctx.fillStyle = P.axisLabel; ctx.fillText(String(qc.br), cx + off, cy + off)
    ctx.globalAlpha = 1.0
  }
}

/* ── Multigraph sparkline ──────────────────────────────────── */

export function drawMultigraph(
  ctx: CanvasRenderingContext2D, mg: Multigraph,
  cx: number, cy: number, radius: number, size: number,
  progress: number, P: GaugePalette,
): void {
  const data = mg.data
  if (!data.length) return
  const gLeft = cx - radius * 0.65, gRight = cx + radius * 0.65
  const gTop = cy - radius * 0.15, gBottom = cy + radius * 0.55
  const gWidth = gRight - gLeft, gHeight = gBottom - gTop
  const dataMin = Math.min(...data) * 0.8, dataMax = Math.max(...data) * 1.1

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5
  for (let i = 0; i <= 4; i++) {
    const y = gTop + (i / 4) * gHeight
    ctx.beginPath(); ctx.moveTo(gLeft, y); ctx.lineTo(gRight, y); ctx.stroke()
  }

  // Area fill
  const visible = Math.max(1, Math.ceil(data.length * progress))
  ctx.beginPath(); ctx.moveTo(gLeft, gBottom)
  for (let i = 0; i < visible; i++) {
    const x = gLeft + (i / (data.length - 1)) * gWidth
    const y = gBottom - ((data[i] - dataMin) / (dataMax - dataMin)) * gHeight
    ctx.lineTo(x, y)
  }
  const lastX = gLeft + ((visible - 1) / (data.length - 1)) * gWidth
  ctx.lineTo(lastX, gBottom); ctx.closePath()
  const ag = ctx.createLinearGradient(0, gTop, 0, gBottom)
  ag.addColorStop(0, mg.color + '30'); ag.addColorStop(1, mg.color + '05')
  ctx.fillStyle = ag; ctx.fill()

  // Line
  ctx.beginPath()
  for (let i = 0; i < visible; i++) {
    const x = gLeft + (i / (data.length - 1)) * gWidth
    const y = gBottom - ((data[i] - dataMin) / (dataMax - dataMin)) * gHeight
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = mg.color; ctx.lineWidth = 1.8
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()

  // End dot
  if (visible > 0) {
    const ei = visible - 1
    const ex = gLeft + (ei / (data.length - 1)) * gWidth
    const ey = gBottom - ((data[ei] - dataMin) / (dataMax - dataMin)) * gHeight
    ctx.save(); ctx.shadowColor = mg.color; ctx.shadowBlur = 8
    circ(ctx, ex, ey, 3); ctx.fillStyle = mg.color; ctx.fill(); ctx.restore()
  }

  if (mg.label) {
    ctx.font = `600 ${Math.max(6, size * 0.035)}px 'Barlow Condensed','Outfit',sans-serif`
    ctx.fillStyle = P.axisLabel; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText(mg.label, cx, gTop - 4)
  }
}
