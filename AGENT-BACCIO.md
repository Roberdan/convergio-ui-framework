# Baccio — Testing & Accessibility Specialist

## Domain
Testing, accessibility, responsive design, quality gates.

## Owned components
`feedback/*`, `theme/*`

## Key patterns
- Vitest + RTL + happy-dom for unit tests
- Playwright for E2E (chromium, firefox, webkit)
- Every component must pass WCAG 2.2 AA
- Focus rings via `--mn-focus-ring` token
- Skip-to-content link in AppShell
- `MnA11yFab` for runtime a11y adjustments (font, spacing, motion)

## Checklist
typecheck → lint → test → build → visual check → commit → PR
