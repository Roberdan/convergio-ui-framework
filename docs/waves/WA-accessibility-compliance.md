# Wave WA — Accessibility Compliance

**Plan**: 10050 | **Wave ID**: 2509 | **Date**: 02 April 2026

## Summary

WCAG 2.2 AA accessibility wave: global focus management, semantic HTML/ARIA,
and semantic status color tokens with non-color cues.

## Changes

| Task | File(s) | What |
|---|---|---|
| A-01 | `globals.css`, `layout.tsx`, `app-shell.tsx` | Global `focus-visible` ring styles, skip-to-main-content link, 44x44px min touch targets |
| A-02 | `header.tsx`, `data-table.tsx`, `agents/page.tsx`, `activity-feed.tsx`, `ai-chat-panel.tsx` | Breadcrumb `ol/li` + `aria-current`, `th scope="col"`, `aria-live="polite"` on dynamic areas, `aria-label` on chat input |
| A-03 | `globals.css`, `activity-feed.tsx`, `kpi-card.tsx`, `agents/page.tsx`, `activity/page.tsx`, `settings/page.tsx` | Replace hardcoded color classes with `--status-*` CSS custom properties (all 4 themes), add `sr-only` text labels as non-color cues |
| WA-doc | `docs/waves/WA-accessibility-compliance.md` | This document |

## Semantic Status Tokens

Added to all 4 themes (navy, light, dark, colorblind):

| Token | Purpose | Colorblind value (Okabe-Ito) |
|---|---|---|
| `--status-success` | Positive state | `#009E73` |
| `--status-warning` | Caution state | `#E69F00` |
| `--status-error` | Error/failure | `#C94000` |
| `--status-info` | Informational | `#0072B2` |

Tailwind mappings: `bg-status-success`, `text-status-success`, etc.

## Rationale

- **Focus-visible**: keyboard users had no visible focus indicator on interactive elements
- **Skip link**: screen reader and keyboard users had no way to bypass repeated navigation
- **Touch targets**: mobile users could not reliably tap small buttons (< 44px)
- **Semantic HTML**: breadcrumbs lacked `ol/li` structure; tables lacked `scope` on headers
- **aria-live**: dynamic content updates (activity feed, chat messages) were invisible to screen readers
- **Status colors**: hardcoded Tailwind color classes (text-green-500, bg-yellow-500) broke in colorblind theme and provided no non-color differentiation

## Verification

- `tsc --noEmit` passes with zero errors
- All changes work across navy, light, dark, and colorblind themes
- Status indicators now have both color and text (sr-only or visible) cues
