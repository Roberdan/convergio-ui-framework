# Plan 10040 Running Notes

## W1: Runtime source of truth

- Decision: convergio.yaml is the single runtime config source; TS config files become deprecated re-exports
- Issue: Lucide icon components cannot serialize through YAML → Fix: icon-map.ts resolves string names client-side
- Issue: kernel evidence gate runs `npx vitest run` hardcoded → Fix: added vitest.config.ts with passWithNoTests
- Pattern: server components load config via loader functions; client components receive config as props

## W2: Starter baseline neutralization

- Decision: replace product-specific demo content with realistic but generic internal-tools examples
- Pattern: keep the same UI structure and block types; only change labels, names, and event descriptions
- Issue: 2 pre-existing lint errors in sidebar-nav.tsx (not introduced by this wave)

## W3: Server-first data path

- Decision: single API client singleton from validated env; server actions for mutations
- Pattern: graceful fallback when backend unavailable — ApiError returns failure, network error logs warning and returns success message
- Issue: dashboard page data still comes from YAML config (acceptable for starter — shows the pattern)

## W4: AI routing hardening

- Decision: provider routing via exhaustive switch, not dynamic import — keeps bundle predictable
- Pattern: unsupported providers return 501 with clear install instructions rather than silently failing

## W5: Auth boundary wiring

- Decision: simple cookie-based auth for starter; clearly marked as demo-only
- Issue: E2E tests need auth bypass → solved with `context.addCookies` in beforeEach
- Pattern: server actions for both login and logout; no client-side auth state

## W6: Starter productization

- Decision: README is the primary starter guide — rewritten from scratch rather than patched
- Pattern: each major feature gets its own section with quick-start instructions
- Kept Tauri but positioned as clearly optional with separate install step
