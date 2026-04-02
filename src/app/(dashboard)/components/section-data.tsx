'use client';

import { useState } from 'react';
import {
  MnDataTable, MnDetailPanel, MnEntityWorkbench,
  MnFacetWorkbench, MnChat, MnOkr, MnSystemStatus,
} from '@/components/maranello';
import {
  tableColumns, tableRows, detailSections, facetGroups,
  chatMessages, quickActions, objectives, services, incidents,
} from './components-data';

function Card({ name, desc, children, wide }: { name: string; desc: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 space-y-3 ${wide ? 'md:col-span-2' : ''}`}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SectionData() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [msgs, setMsgs] = useState(chatMessages);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-data-table" desc="Sortable, filterable, paginated data table" wide>
        <MnDataTable
          columns={tableColumns}
          data={tableRows}
          pageSize={3}
          selectable="multi"
          aria-label="Agent performance"
        />
      </Card>

      <Card name="mn-detail-panel" desc="Slide-out detail panel with edit mode">
        <button onClick={() => setDetailOpen(true)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Open Detail Panel
        </button>
        <MnDetailPanel
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title="Agent: Ali"
          sections={detailSections}
          onSave={(data) => { setDetailOpen(false); }}
        />
      </Card>

      <Card name="mn-entity-workbench" desc="Multi-tab entity editor with drag reorder">
        <div className="h-48 border border-border rounded-lg overflow-hidden">
          <MnEntityWorkbench
            tabs={[
              { id: 'ali', label: 'Ali', dirty: true },
              { id: 'rex', label: 'Rex' },
              { id: 'sara', label: 'Sara' },
            ]}
            onTabClose={() => {}}
            onTabAdd={() => {}}
            renderContent={(tab) => (
              <div className="p-4 text-sm text-muted-foreground">
                Configuration for agent {tab.label}
              </div>
            )}
          />
        </div>
      </Card>

      <Card name="mn-facet-workbench" desc="Filter sidebar with multi-select facets">
        <MnFacetWorkbench groups={facetGroups} />
      </Card>

      <Card name="mn-chat" desc="AI chat interface with code rendering and quick actions" wide>
        <div className="h-80">
          <MnChat
            messages={msgs}
            quickActions={quickActions}
            onSend={(text) => setMsgs((prev) => [...prev, { id: String(prev.length + 1), role: 'user', content: text, timestamp: new Date() }])}
          />
        </div>
      </Card>

      <Card name="mn-okr" desc="OKR dashboard with objectives, key results, and progress">
        <MnOkr objectives={objectives} period="Q2 2026" />
      </Card>

      <Card name="mn-system-status" desc="Service health dashboard with uptime and incidents">
        <MnSystemStatus
          services={services}
          incidents={incidents}
          version="v19.4.0"
          environment="production"
        />
      </Card>
    </div>
  );
}
