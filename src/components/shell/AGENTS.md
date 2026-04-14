# Shell Components

App shell — the outermost layout wrapper.

| File | What |
|------|------|
| `app-shell.tsx` | Main layout: sidebar + header + content. Accepts `a11ySlot` prop. |
| `sidebar.tsx` | Collapsible sidebar with nav sections. Reads from `loadNavSections()`. |
| `header.tsx` | Top bar with menu toggle + breadcrumb. |
| `search-combobox.tsx` | Cmd+K fuzzy search across component catalog. |
| `sidebar-nav.tsx` | Nav item rendering with active state + icons. |

## Rules
- Shell must work with **zero Maranello components** installed.
- All navigation data comes from `maranello.yaml` via config-loader.
- `AppShell` is a `"use client"` component (uses `useState`, `usePathname`).
