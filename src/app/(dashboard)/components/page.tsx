'use client';

import { useState } from 'react';
import { MnTabs, MnTabList, MnTab, MnTabPanel, MnA11y } from '@/components/maranello';
import { SectionPrimitives } from './section-primitives';
import { SectionShell } from './section-shell';
import { SectionData } from './section-data';
import { SectionCharts } from './section-charts';
import { SectionA11y } from './section-a11y';
import { SectionDataviz } from './section-dataviz';
import { SectionNetwork } from './section-network';
import { SectionAgentic } from './section-agentic';
import { SectionStrategy } from './section-strategy';

const CATEGORIES = [
  { id: 'primitives', label: 'Primitives (8)', count: 8 },
  { id: 'shell', label: 'Shell (9)', count: 9 },
  { id: 'data', label: 'Data (7)', count: 7 },
  { id: 'charts', label: 'Charts (10)', count: 10 },
  { id: 'a11y', label: 'Accessibility (6)', count: 6 },
  { id: 'dataviz', label: 'Data Viz (6)', count: 6 },
  { id: 'network', label: 'Network (6)', count: 6 },
  { id: 'agentic', label: 'Agentic (5)', count: 5 },
  { id: 'strategy', label: 'Strategy (6)', count: 6 },
] as const;

export default function ComponentsPage() {
  const [active, setActive] = useState<string>('primitives');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Maranello Component Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          63 components across 9 categories. Each rendered with realistic Convergio platform data.
        </p>
      </div>

      <MnTabs value={active} onValueChange={setActive}>
        <MnTabList className="overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <MnTab key={cat.id} value={cat.id}>{cat.label}</MnTab>
          ))}
        </MnTabList>

        <MnTabPanel value="primitives"><SectionPrimitives /></MnTabPanel>
        <MnTabPanel value="shell"><SectionShell /></MnTabPanel>
        <MnTabPanel value="data"><SectionData /></MnTabPanel>
        <MnTabPanel value="charts"><SectionCharts /></MnTabPanel>
        <MnTabPanel value="a11y"><SectionA11y /></MnTabPanel>
        <MnTabPanel value="dataviz"><SectionDataviz /></MnTabPanel>
        <MnTabPanel value="network"><SectionNetwork /></MnTabPanel>
        <MnTabPanel value="agentic"><SectionAgentic /></MnTabPanel>
        <MnTabPanel value="strategy"><SectionStrategy /></MnTabPanel>
      </MnTabs>

      <MnA11y />
    </div>
  );
}
