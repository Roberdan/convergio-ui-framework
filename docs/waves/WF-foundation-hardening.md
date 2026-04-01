# Wave WF — Foundation Hardening

**Plan**: 10050 | **Wave ID**: 2508 | **Date**: 01 April 2026

## Summary

Foundation hardening wave addressing hydration, validation, error handling,
responsiveness, and file structure across the convergio-frontend codebase.

## Changes

| Task | File(s) | What |
|---|---|---|
| F-01 | `theme-provider.tsx`, `theme-script.tsx`, `layout.tsx` | Fix theme hydration: `suppressHydrationWarning` on html/script, dynamic dark class based on defaultTheme |
| F-02 | `settings/page.tsx` | Client-side validation before server action, `role="alert"` for errors, responsive grid |
| F-03 | `config-schema.ts`, `config-loader.ts` | Zod schema for `convergio.yaml`, validated at load time with actionable error messages |
| F-04 | `page-renderer.tsx` | Mobile-first responsive grid, `console.warn` for unknown block types |
| F-05 | `global-error.tsx`, `(dashboard)/error.tsx` | Global + dashboard error boundaries with retry, error digest display |
| F-06 | `api/chat/route.ts` | Zod input validation, structured error responses, rate limit headers |
| F-07 | `dropdown-menu.tsx`, `dropdown-menu-items.tsx` | Split to stay under 250 lines, a11y trigger styling |

## Rationale

- **Hydration**: hardcoded `dark` class on `<html>` caused flash when stored theme was `light`
- **Config validation**: YAML parse errors surfaced as cryptic runtime errors; Zod provides actionable messages
- **Error boundaries**: missing `global-error.tsx` meant root-level errors showed Next.js default
- **Responsiveness**: PageRenderer used inline `gridTemplateColumns` with no mobile breakpoint
- **API validation**: chat route accepted arbitrary JSON without schema validation
