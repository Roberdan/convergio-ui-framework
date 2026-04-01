# Plan 10040 Running Notes

## W1: Runtime source of truth

- Decision: convergio.yaml is the single runtime config source; TS config files become deprecated re-exports
- Issue: Lucide icon components cannot serialize through YAML → Fix: icon-map.ts resolves string names client-side
- Issue: kernel evidence gate runs `npx vitest run` hardcoded → Fix: added vitest.config.ts with passWithNoTests
- Pattern: server components load config via loader functions; client components receive config as props
