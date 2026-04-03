'use client';

import {
  MnEntityWorkbench,
  MnFacetWorkbench,
  MnGantt,
  MnKanbanBoard,
} from '@/components/maranello';
import type { GanttTask, KanbanColumn, KanbanCard, FacetGroup } from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

const ganttTasks: GanttTask[] = [
  { id: 'design', title: 'System Design', start: '2025-07-01', end: '2025-07-14', status: 'completed', progress: 1 },
  { id: 'api', title: 'API Development', start: '2025-07-10', end: '2025-07-28', status: 'active', progress: 0.6 },
  { id: 'mesh', title: 'Mesh Integration', start: '2025-07-21', end: '2025-08-04', status: 'planned' },
  { id: 'testing', title: 'Load Testing', start: '2025-08-01', end: '2025-08-11', status: 'planned' },
  { id: 'launch', title: 'Production Launch', start: '2025-08-11', end: '2025-08-11', status: 'planned', milestone: true },
];

const kanbanColumns: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', color: '#6b7280' },
  { id: 'active', title: 'In Progress', color: '#3b82f6' },
  { id: 'review', title: 'Review', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#22c55e' },
];

const kanbanCards: KanbanCard[] = [
  { id: 'k1', columnId: 'backlog', title: 'Add retry logic to mesh relay', priority: 'medium', tags: ['backend'] },
  { id: 'k2', columnId: 'active', title: 'Implement token budget alerts', priority: 'high', assignee: 'Elena', tags: ['finops'] },
  { id: 'k3', columnId: 'active', title: 'Agent trace visualization', priority: 'medium', assignee: 'Marco', tags: ['frontend'] },
  { id: 'k4', columnId: 'review', title: 'OAuth2 PKCE integration', priority: 'high', assignee: 'Arjun', tags: ['auth'] },
  { id: 'k5', columnId: 'done', title: 'Deploy health check endpoint', priority: 'low', assignee: 'Sofia', tags: ['ops'] },
];

const facetGroups: FacetGroup[] = [
  { id: 'status', label: 'Status', options: [
    { id: 'active', label: 'Active', count: 12 },
    { id: 'paused', label: 'Paused', count: 3 },
    { id: 'archived', label: 'Archived', count: 8 },
  ]},
  { id: 'model', label: 'Model', options: [
    { id: 'gpt4', label: 'GPT-4o', count: 7 },
    { id: 'claude', label: 'Claude 3.5', count: 5 },
    { id: 'gemini', label: 'Gemini Pro', count: 3 },
  ]},
  { id: 'region', label: 'Region', type: 'single-select', options: [
    { id: 'us-east', label: 'US East', count: 9 },
    { id: 'eu-west', label: 'EU West', count: 6 },
    { id: 'ap-south', label: 'AP South', count: 4 },
  ]},
];

/** Sub-section: Operations & Workbench components. */
export function ShowcaseAdvancedOps() {
  return (
    <>
      <div className="md:col-span-2">
        <ComponentDoc entry={entry('mn-gantt')} example={`<MnGantt tasks={tasks} showToday />`}>
          <MnGantt tasks={ganttTasks} showToday />
        </ComponentDoc>
      </div>

      <div className="md:col-span-2">
        <ComponentDoc entry={entry('mn-kanban-board')} example={`<MnKanbanBoard columns={cols} cards={cards} />`}>
          <MnKanbanBoard columns={kanbanColumns} cards={kanbanCards} />
        </ComponentDoc>
      </div>

      <div className="md:col-span-2">
        <ComponentDoc entry={entry('mn-entity-workbench')} example={`<MnEntityWorkbench tabs={tabs} activeTabId="orch" renderContent={fn} />`}>
          <div className="h-48 border border-border rounded-lg overflow-hidden">
            <MnEntityWorkbench
              tabs={[
                { id: 'orch', label: 'Orchestrator', dirty: true },
                { id: 'plan', label: 'Planner' },
                { id: 'deploy', label: 'Deployer' },
              ]}
              activeTabId="orch"
              onTabClose={() => {}}
              onSave={() => {}}
              renderContent={(tab) => (
                <div className="p-4 text-sm text-muted-foreground">
                  Editing entity: <strong>{tab.label}</strong>
                </div>
              )}
            />
          </div>
        </ComponentDoc>
      </div>

      <ComponentDoc entry={entry('mn-facet-workbench')} example={`<MnFacetWorkbench groups={groups} />`}>
        <MnFacetWorkbench groups={facetGroups} />
      </ComponentDoc>
    </>
  );
}
