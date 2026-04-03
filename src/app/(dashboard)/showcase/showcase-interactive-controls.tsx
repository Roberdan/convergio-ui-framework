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
  MnAsyncSelect,
  MnDatePicker,
  MnFormField,
  MnProfile,
} from '@/components/maranello';
import type { ActiveFilters, SearchDrawerResult, AsyncSelectItem } from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import { COMPONENT_PROPS } from './component-props';
import { filterSections, mockSearchResults } from './showcase-interactive-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

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

  const agentProvider = useCallback(
    async (query: string): Promise<AsyncSelectItem[]> => {
      const agents = [
        { id: 'orch', label: 'Orchestrator' },
        { id: 'plan', label: 'Planner' },
        { id: 'code', label: 'Code Generator' },
        { id: 'review', label: 'Reviewer' },
        { id: 'deploy', label: 'Deployer' },
        { id: 'monitor', label: 'Monitor' },
      ];
      return agents.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));
    },
    [],
  );

  return (
    <>
      <ComponentDoc entry={entry('mn-date-range-picker')} example={`<MnDateRangePicker placeholder="Pick a date range" />`}>
        <MnDateRangePicker placeholder="Pick a date range" />
      </ComponentDoc>

      <ComponentDoc
        entry={entry('mn-filter-panel')}
        props={COMPONENT_PROPS['mn-filter-panel']}
        example={`<MnFilterPanel sections={sections} filters={filters} onFilterChange={setFilters} />`}
      >
        <MnFilterPanel sections={filterSections} filters={filters} onFilterChange={setFilters} />
      </ComponentDoc>

      <ComponentDoc
        entry={entry('mn-search-drawer')}
        props={COMPONENT_PROPS['mn-search-drawer']}
        example={`<MnSearchDrawer open={open} onOpenChange={setOpen} onSearch={handleSearch} />`}
      >
        <button onClick={() => setDrawerOpen(true)} className="px-3 py-1.5 rounded border text-sm">
          Open Search Drawer
        </button>
        <MnSearchDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Search Platform" onSearch={handleSearch} />
      </ComponentDoc>

      <ComponentDoc
        entry={entry('mn-section-card')}
        props={COMPONENT_PROPS['mn-section-card']}
        example={`<MnSectionCard title="Config" badge={3} collapsible>Content</MnSectionCard>`}
      >
        <MnSectionCard title="Agent Configuration" badge={3} collapsible>
          <p className="text-sm text-muted-foreground">
            Configure orchestration parameters, model routing rules, and cost guardrails for each agent in the mesh.
          </p>
        </MnSectionCard>
      </ComponentDoc>

      <div className="md:col-span-2">
        <ComponentDoc
          entry={entry('mn-grid-layout')}
          props={COMPONENT_PROPS['mn-grid-layout']}
          example={`<MnGridLayout columns={3} gap="md">\n  <MnGridItem>Cell</MnGridItem>\n</MnGridLayout>`}
        >
          <MnGridLayout columns={3} gap="md" aria-label="Sample grid">
            <MnGridItem className="rounded border border-border bg-muted p-3 text-sm">Cell A</MnGridItem>
            <MnGridItem className="rounded border border-border bg-muted p-3 text-sm">Cell B</MnGridItem>
            <MnGridItem span={1} className="rounded border border-border bg-muted p-3 text-sm">Cell C</MnGridItem>
          </MnGridLayout>
        </ComponentDoc>
      </div>

      <div className="md:col-span-2">
        <ComponentDoc entry={entry('mn-dashboard-renderer')} example={`<MnDashboardRenderer schema={schema} data={data} />`}>
          <MnDashboardRenderer
            schema={{
              rows: [{ columns: [
                { type: 'stat-card', dataKey: 'agents' },
                { type: 'stat-card', dataKey: 'tasks' },
                { type: 'stat-card', dataKey: 'uptime' },
              ] }],
            }}
            data={{
              agents: { label: 'Active Agents', value: 12 },
              tasks: { label: 'Tasks Today', value: 487 },
              uptime: { label: 'Uptime', value: '99.7%' },
            }}
          />
        </ComponentDoc>
      </div>

      <div className="md:col-span-2">
        <ComponentDoc entry={entry('mn-login')} example={`<MnLogin title="App" onSubmit={handleSubmit} />`}>
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
        </ComponentDoc>
      </div>

      <ComponentDoc entry={entry('mn-async-select')} example={`<MnAsyncSelect provider={searchFn} placeholder="Search..." onSelect={fn} />`}>
        <MnAsyncSelect provider={agentProvider} placeholder="Search agents..." onSelect={() => {}} />
      </ComponentDoc>

      <ComponentDoc entry={entry('mn-date-picker')} example={`<MnDatePicker placeholder="Select date" />`}>
        <MnDatePicker placeholder="Select deployment date" />
      </ComponentDoc>

      <ComponentDoc
        entry={entry('mn-form-field')}
        props={COMPONENT_PROPS['mn-form-field']}
        example={`<MnFormField fieldId="name" label="Name" required>\n  <input type="text" />\n</MnFormField>`}
      >
        <div className="space-y-3">
          <MnFormField fieldId="agent-name" label="Agent Name" hint="Alphanumeric, 3–32 characters" required>
            <input type="text" defaultValue="Orchestrator-Prime" className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm" />
          </MnFormField>
          <MnFormField fieldId="max-tokens" label="Max Tokens" error="Value must be between 1 and 128000">
            <input type="number" defaultValue="200000" className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm" />
          </MnFormField>
        </div>
      </ComponentDoc>

      <ComponentDoc entry={entry('mn-profile')} example={`<MnProfile name="Elena" email="elena@co.dev" sections={sections} />`}>
        <MnProfile
          name="Elena Vasquez"
          email="elena@convergio.dev"
          sections={[
            { title: 'Account', items: [{ label: 'Settings' }, { label: 'API Keys', badge: 3 }] },
            { items: [{ label: 'Sign out', danger: true }] },
          ]}
        />
      </ComponentDoc>
    </>
  );
}
