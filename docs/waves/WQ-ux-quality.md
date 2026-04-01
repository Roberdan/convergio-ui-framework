# Wave WQ -- UX Quality

**Plan**: 10050 | **Wave ID**: 2511 | **Date**: 01 Aprile 2026

## Summary

UX quality improvements across block components, chat panel, and design tokens.

## Tasks

| ID | Title | Status |
|---|---|---|
| Q-01 (10131) | Block loading/empty/error states + normalized API | submitted |
| Q-02 (10132) | Chat UX: streaming indicator, error display, reset | submitted |
| Q-03 (10133) | Mobile nav + dashboard page dedup audit | submitted |
| Q-04 (10134) | Token ladder + icon system centralization | submitted |
| WQ-doc (10135) | Wave documentation | submitted |

## Changes

### Q-01: Block State Handling

- Created `src/components/blocks/block-wrapper.tsx` -- shared loading/empty/error wrapper
- Added `loading`, `error`, `onRetry` props to KpiCard, DataTable, ActivityFeed, StatList
- DataTable and ActivityFeed auto-detect empty state from data length
- Four skeleton variants: card, table, feed, list
- Error state includes optional retry button
- Empty state renders dashed border with Inbox icon

### Q-02: Chat Panel UX

- Added streaming indicator (spinner + "is typing..." text)
- Added error display with AlertTriangle icon and message
- Added conversation reset button (RotateCcw icon) in agent selector bar
- Agent switching now clears conversation history
- Send button shows spinner during loading
- Extracted ChatBubble and ChatError sub-components

### Q-03: Mobile Navigation Audit

- Sidebar already implements responsive behavior via Sheet overlay on mobile
- Header hamburger menu toggles sidebar on all breakpoints
- No duplicate root page.tsx found -- `(dashboard)/page.tsx` serves `/` correctly
- No changes needed

### Q-04: Design Tokens + Icons

- Added spacing tokens: `--spacing-page`, `--spacing-section`, `--spacing-card`, `--spacing-inline`
- Added typography scale tokens: `--text-xs` through `--text-2xl`, `--leading-tight/normal`
- Expanded icon-map.ts from 9 to 29 icons covering all used across the codebase
- Icon-map serves dynamic resolution; direct imports remain valid for static usage

## Files Modified

| File | Change |
|---|---|
| `src/components/blocks/block-wrapper.tsx` | NEW -- shared state wrapper |
| `src/components/blocks/kpi-card.tsx` | Added loading/error props |
| `src/components/blocks/data-table.tsx` | Added loading/error/empty props |
| `src/components/blocks/activity-feed.tsx` | Added loading/error/empty props |
| `src/components/blocks/stat-list.tsx` | Added loading/error/empty props |
| `src/components/blocks/ai-chat-panel.tsx` | Streaming, error, reset UX |
| `src/components/blocks/index.ts` | Export BlockWrapper |
| `src/lib/icon-map.ts` | Expanded to 29 icons |
| `src/app/globals.css` | Spacing + typography tokens |
