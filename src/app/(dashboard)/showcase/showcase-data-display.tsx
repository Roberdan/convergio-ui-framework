'use client';

import { useState } from 'react';
import {
  MnAvatar,
  MnAvatarGroup,
  MnBadge,
  MnDataTable,
  MnDetailPanel,
  MnFlipCounter,
  MnProgressRing,
  MnSourceCards,
  MnSpinner,
  MnUserTable,
} from '@/components/maranello';
import type { DataTableColumn } from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import { adminUsers, sourceCards } from './showcase-interactive-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

const tableColumns: DataTableColumn<Record<string, unknown>>[] = [
  { key: 'name', label: 'Agent', sortable: true, filterable: true },
  { key: 'status', label: 'Status', type: 'status', sortable: true },
  { key: 'tasks', label: 'Tasks', sortable: true },
  { key: 'latency', label: 'Latency', sortable: true },
];

const tableData = [
  { name: 'Orchestrator', status: 'active', tasks: 1247, latency: '45ms' },
  { name: 'Planner', status: 'active', tasks: 892, latency: '120ms' },
  { name: 'Code Generator', status: 'warning', tasks: 634, latency: '380ms' },
  { name: 'Reviewer', status: 'active', tasks: 421, latency: '90ms' },
  { name: 'Deployer', status: 'inactive', tasks: 0, latency: '—' },
];

export function ShowcaseDataDisplay() {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <section aria-labelledby="section-data-display">
      <h2 id="section-data-display" className="mb-4 text-lg font-semibold">
        Data Display
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ComponentDoc entry={entry('mn-badge')} example={`<MnBadge tone="success">Operational</MnBadge>`}>
          <div className="flex flex-wrap gap-2">
            <MnBadge tone="success">Operational</MnBadge>
            <MnBadge tone="warning">At risk</MnBadge>
            <MnBadge tone="danger">Blocked</MnBadge>
            <MnBadge tone="info">Needs review</MnBadge>
            <MnBadge tone="neutral">Draft</MnBadge>
          </div>
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-avatar')} example={`<MnAvatar initials="AL" size="sm" status="online" />`}>
          <div className="flex items-center gap-4">
            <MnAvatar initials="AL" size="sm" status="online" />
            <MnAvatar initials="MR" size="md" status="busy" />
            <MnAvatar initials="JK" size="lg" status="away" />
            <MnAvatarGroup max={3}>
              <MnAvatar initials="TS" size="md" />
              <MnAvatar initials="PL" size="md" />
              <MnAvatar initials="KW" size="md" />
              <MnAvatar initials="RD" size="md" />
            </MnAvatarGroup>
          </div>
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-progress-ring')} example={`<MnProgressRing value={87} size="lg" variant="primary" label="Completion" />`}>
          <div className="flex items-center gap-4">
            <MnProgressRing value={87} size="lg" variant="primary" label="Completion" />
            <MnProgressRing value={42} size="md" variant="muted" label="Adoption" />
            <MnProgressRing value={100} size="sm" variant="success" label="Tests" />
          </div>
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-flip-counter')} example={`<MnFlipCounter value={1847} digits={5} size="sm" label="Tasks" />`}>
          <MnFlipCounter value={1847} digits={5} size="sm" label="Tasks processed" />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-spinner')} example={`<MnSpinner size="md" variant="muted" label="Loading" />`}>
          <div className="flex items-center gap-4">
            <MnSpinner size="sm" variant="primary" label="Loading" />
            <MnSpinner size="md" variant="muted" label="Processing" />
            <MnSpinner size="lg" variant="destructive" label="Error state" />
          </div>
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-data-table')} example={`<MnDataTable columns={columns} data={rows} pageSize={5} />`}>
          <MnDataTable columns={tableColumns} data={tableData} pageSize={5} aria-label="Agent overview" />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-detail-panel')} example={`<MnDetailPanel open={open} onOpenChange={setOpen} title="Agent Configuration" />`}>
          <button onClick={() => setDetailOpen(true)} className="rounded border px-3 py-1.5 text-sm">
            Open Detail Panel
          </button>
          <MnDetailPanel
            open={detailOpen}
            onOpenChange={setDetailOpen}
            title="Agent Configuration"
            editable
            onSave={() => setDetailOpen(false)}
            sections={[
              {
                title: 'General',
                fields: [
                  { key: 'name', label: 'Agent Name', type: 'text', value: 'Orchestrator-Prime' },
                  { key: 'model', label: 'Model', type: 'select', value: 'gpt-4o', options: [{ value: 'gpt-4o', label: 'GPT-4o' }, { value: 'claude-3.5', label: 'Claude 3.5' }] },
                  { key: 'active', label: 'Active', type: 'boolean', value: true },
                ],
              },
            ]}
          />
        </ComponentDoc>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-user-table')} example={`<MnUserTable users={users} searchable />`}>
            <MnUserTable users={adminUsers} searchable selectable={false} />
          </ComponentDoc>
        </div>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-source-cards')} example={`<MnSourceCards cards={cards} layout="grid" />`}>
            <MnSourceCards cards={sourceCards} layout="grid" ariaLabel="Knowledge base results" />
          </ComponentDoc>
        </div>
      </div>
    </section>
  );
}
