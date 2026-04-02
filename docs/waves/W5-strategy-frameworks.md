# W5 — Strategy & Business Frameworks

Wave 5 of Plan 10050. Adds five business strategy components to the Maranello design system.

## Components

| Component | File | Purpose |
|---|---|---|
| MnStrategyCanvas | `mn-strategy-canvas.tsx` | Business Model Canvas with 9-segment BMC grid layout, click-to-add/remove items |
| MnSwot | `mn-swot.tsx` | SWOT Analysis 2x2 color-coded quadrant grid |
| MnPorterFiveForces | `mn-porter-five-forces.tsx` | Porter's Five Forces diamond layout with SVG connectors |
| MnFinOps | `mn-finops.tsx` | Financial operations dashboard with budget vs actual bars and trend indicators |
| MnCustomerJourneyMap | `mn-customer-journey-map.tsx` | Horizontal timeline of customer journey stages with sentiment-colored touchpoints |

## Props Summary

- **MnStrategyCanvas**: `segments: {label, items}[]`, `onChange?` for editable mode
- **MnSwot**: `strengths, weaknesses, opportunities, threats: string[]`
- **MnPorterFiveForces**: `forces: {name, level, notes?}[]` (5 items, center=rivalry)
- **MnFinOps**: `metrics: {label, value, trend, budget}[]`, `formatValue?`
- **MnCustomerJourneyMap**: `stages: {name, touchpoints: {channel, sentiment}[]}[]`

## Design Decisions

- SVG+CSS only, no external chart libraries
- Tailwind semantic tokens for 4-theme support (light/dark variants via dark: prefix)
- All components use `role`/`aria-label` for accessibility
- BMC uses CSS Grid with col-span/row-span for canonical 9-block layout
- Porter's uses SVG connector lines between center and peripheral force cards
- FinOps overspend shown with destructive color token
- Journey map scrolls horizontally on small screens

## Tasks

| DB ID | Description | Status |
|---|---|---|
| 10166 | MnStrategyCanvas + MnSWOT + MnPorterFiveForces | submitted |
| 10167 | MnFinOps + MnCustomerJourneyMap | submitted |
| 10168 | Barrel exports update | submitted |
| 10169 | Wave documentation | submitted |
