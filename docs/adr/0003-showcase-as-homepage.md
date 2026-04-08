# ADR 0003: Showcase as Homepage, Dashboard as Sub-route

Status: Accepted | Date: 08 Apr 2026

## Context

The framework was deployed to Vercel as a public demo (`convergio-frontend.vercel.app`). The root URL `/` previously rendered a live runtime dashboard that required a running daemon to show meaningful content. Without the daemon, visitors saw an empty page with disconnected metrics — a poor first impression.

The showcase page (`/showcase`) had all the visual richness: category grid, cockpit instruments, signature preview, and component browser. But it was buried behind a click.

## Decision

- **`/` (homepage)** renders the showcase: component explorer, category grid, open-source badges, GitHub link, and signature preview
- **`/dashboard`** hosts the live runtime dashboard (agent mesh, Brain 3D, metrics, system status)
- Sidebar navigation has both: "Home" (/) and "Dashboard" (/dashboard)

## Consequences

- Positive: First-time visitors immediately see the framework's capabilities
- Positive: Open-source branding (MIT badge, GitHub button) is front and center
- Positive: Live dashboard remains accessible for daemon-connected users
- Negative: None significant — the dashboard was already demo-mode-safe with seeded fallback data
