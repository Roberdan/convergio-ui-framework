'use client';

import { useState, useCallback } from 'react';
import {
  MnDateRangePicker,
  MnFilterPanel,
  MnSearchDrawer,
  MnGridLayout,
  MnGridItem,
  MnSectionCard,
  MnDashboardRenderer,
  MnLogin,
} from '@/components/maranello';
import type { ActiveFilters, SearchDrawerResult } from '@/components/maranello';
import { filterSections, mockSearchResults } from './showcase-interactive-data';

/** Sub-section: Forms, Navigation & Layout interactive components. */
export function ShowcaseInteractiveControls() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ActiveFilters>({});

  const handleSearch = useCallback(
    async (query: string): Promise<SearchDrawerResult[]> => {
      const q = query.toLowerCase();
      return mockSearchResults.filter(
        r => r.title.toLowerCase().includes(q) || r.subtitle?.toLowerCase().includes(q),
      );
    },
    [],
  );

  return (
    <>
      {/* Date Range Picker */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">MnDateRangePicker</h3>
        <MnDateRangePicker placeholder="Pick a date range" />
      </div>

      {/* Filter Panel */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">MnFilterPanel</h3>
        <MnFilterPanel
          sections={filterSections}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Search Drawer */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">MnSearchDrawer</h3>
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-3 py-1.5 rounded border text-sm"
        >
          Open Search Drawer
        </button>
        <MnSearchDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="Search Platform"
          onSearch={handleSearch}
        />
      </div>

      {/* Section Card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">MnSectionCard</h3>
        <MnSectionCard title="Agent Configuration" badge={3} collapsible>
          <p className="text-sm text-muted-foreground">
            Configure orchestration parameters, model routing rules, and cost guardrails for each agent in the mesh.
          </p>
        </MnSectionCard>
      </div>

      {/* Grid Layout */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-medium text-muted-foreground">MnGridLayout</h3>
        <MnGridLayout columns={3} gap="md" aria-label="Sample grid">
          <MnGridItem className="rounded border border-border bg-muted p-3 text-sm">Cell A</MnGridItem>
          <MnGridItem className="rounded border border-border bg-muted p-3 text-sm">Cell B</MnGridItem>
          <MnGridItem span={1} className="rounded border border-border bg-muted p-3 text-sm">Cell C</MnGridItem>
        </MnGridLayout>
      </div>

      {/* Dashboard Renderer */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-medium text-muted-foreground">MnDashboardRenderer</h3>
        <MnDashboardRenderer
          schema={{
            rows: [
              {
                columns: [
                  { type: 'stat-card', dataKey: 'agents' },
                  { type: 'stat-card', dataKey: 'tasks' },
                  { type: 'stat-card', dataKey: 'uptime' },
                ],
              },
            ],
          }}
          data={{
            agents: { label: 'Active Agents', value: 12 },
            tasks: { label: 'Tasks Today', value: 487 },
            uptime: { label: 'Uptime', value: '99.7%' },
          }}
        />
      </div>

      {/* Login */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-medium text-muted-foreground">MnLogin</h3>
        <div className="max-w-sm mx-auto">
          <MnLogin
            title="Convergio"
            titleAccent="Platform"
            subtitle="Sign in to your workspace"
            version="v20.8.0"
            env="staging"
            onSubmit={() => {}}
            checks={[
              { name: 'API', status: 'healthy' },
              { name: 'Mesh', status: 'degraded' },
              { name: 'Database', status: 'healthy' },
            ]}
          />
        </div>
      </div>
    </>
  );
}
