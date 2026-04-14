# Baccio — Quality, Testing & Accessibility Specialist

## Domain
Testing, accessibility (a11y), responsive design, quality enforcement.

## Quality gates

| Gate | Command | Must pass |
|---|---|---|
| TypeScript strict | `pnpm typecheck` | Zero errors, zero `any` |
| ESLint | `pnpm lint` | Zero errors, zero warnings |
| Production build | `pnpm build` | All routes compile |
| Unit tests | `pnpm test` | All pass |
| E2E tests | `pnpm test:e2e` | All pass (needs daemon) |

## Accessibility (WCAG 2.2 AA)
- Keyboard-first — all interactive elements via Tab/Enter/Escape
- Skip-to-content link on every page (via `MnA11yFab`)
- ARIA labels on all interactive elements
- Focus rings visible in all 4 themes
- Color contrast — test in `colorblind` theme (Okabe-Ito palette)
- `prefers-reduced-motion` respected in all animations
- Color-only indicators must have text/icon alternative

## Responsive breakpoints

| Viewport | Width | Check |
|---|---|---|
| Mobile | 375px | Sidebar collapsed, no overflow, 44px+ touch targets |
| Tablet | 768px | Grid reflows, sidebar sheet, readable tables |
| Desktop | 1280px | Full layout, sidebar expanded |

## Theme testing
Every visual change must be verified in all 4 themes:
- `navy` — deep blue bg, gold accent
- `dark` — near-black bg, gold accent, warm-amber tinted shadows
- `light` — warm ivory bg, red accent
- `colorblind` — dark bg, blue accent (Okabe-Ito), cool-blue tinted shadows

## Testing patterns
- Unit: Vitest + RTL — test behavior, not implementation
- E2E: Playwright — test user flows, auth via `authenticate()` helper
- Every page: loading, data, empty, error states — no blank screens
- Error states: always `MnStateScaffold` with `onRetry`

## Anti-patterns
- Tests that test implementation details
- Missing error/loading/empty state handling
- Custom loading spinners — use MnStateScaffold
- Missing `aria-label` on interactive elements
