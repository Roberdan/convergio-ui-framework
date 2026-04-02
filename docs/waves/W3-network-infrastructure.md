# W3 — Network & Infrastructure

Plan 10050, Wave 2517. SVG + CSS only, no charting libraries.

## Components

| Component | File | Purpose |
|---|---|---|
| MnMeshNetwork | `mn-mesh-network.tsx` | SVG mesh topology with interactive node selection |
| MnHubSpoke | `mn-hub-spoke.tsx` | Hub-and-spoke diagram with pulse animation |
| MnDeploymentTable | `mn-deployment-table.tsx` | Sortable deployment table with status badges |
| MnAuditLog | `mn-audit-log.tsx` | Filterable chronological audit log |
| MnActiveMissions | `mn-active-missions.tsx` | Mission tracker with progress bars + agent avatars |
| MnNightJobs | `mn-night-jobs.tsx` | Scheduled job monitor with cron display |

## Accessibility

- MnMeshNetwork: `role="img"`, keyboard-navigable nodes, sr-only node list, tooltip on hover/focus
- MnHubSpoke: `role="img"`, sr-only fallback list, status legend with color + text
- MnDeploymentTable: `aria-sort` on sortable columns, keyboard-operable headers
- MnAuditLog: labeled filter input, focusable entries, load-more pagination
- MnActiveMissions: `role="list"`, `role="progressbar"` with aria-valuenow
- MnNightJobs: `role="list"`, status conveyed via icon + color + text label

## Theming

- All colors via CSS custom properties (`--status-success`, `--status-error`, `--primary`, etc.)
- No hardcoded colors; fallback HSL values for status tokens
- Works across all 4 themes via semantic tokens

## Usage

```tsx
import {
  MnMeshNetwork,
  MnHubSpoke,
  MnDeploymentTable,
  MnAuditLog,
  MnActiveMissions,
  MnNightJobs,
} from '@/components/maranello';
```

## Barrel

All W3 exports added to `src/components/maranello/index.ts`.
