# Plan 10060 Running Notes

## W1: Fix & Restructure
- Decision: Split files at 250-line boundary using .helpers.ts pattern (consistent with existing codebase)
- Issue: 22 files had hardcoded hex colors → Fix: replaced with --mn-* CSS vars and readPalette theme branches
- Issue: Ferrari Controls unreadable on light theme → Fix: added per-theme color branches in readPalette
- Pattern: readPalette() should always detect `data-theme` attribute and branch for light/dark/navy/colorblind
- Decision: Removed /preview entirely — all content unified under /showcase/[category]

## W2: Complete Showcase + A11y
- Decision: Component catalog as single source of truth for search, docs, and registry
- Pattern: Bilingual keywords (EN+IT) enable fuzzy search in both languages
- Issue: cmdk built-in filter conflicted with custom search → Fix: shouldFilter={false}
- Decision: ComponentDoc wrapper is reusable — applied to showcase-utilities as proof of concept
- Pattern: Props data manually curated for accuracy (not auto-extracted) for top 26 components

## W3: Guides & MDX Documentation
- Decision: Generation script (scripts/generate-component-docs.ts) makes docs regeneratable
- Pattern: .mdx frontmatter includes keywords for future full-text search
- Decision: Three separate guides (component, icons, extending) vs one monolithic doc
