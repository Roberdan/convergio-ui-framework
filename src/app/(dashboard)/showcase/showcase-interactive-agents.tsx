'use client';

import { useState } from 'react';
import {
  MnUserTable,
  MnSourceCards,
  MnSocialGraph,
  MnProgressRing,
  MnNotificationCenter,
  MnStreamingText,
  MnAgentTrace,
  MnApprovalChain,
  MnProcessTimeline,
  MnModal,
  MnStateScaffold,
  MnToast,
  toast,
} from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import { COMPONENT_PROPS } from './component-props';
import {
  adminUsers,
  sourceCards,
  socialNodes,
  socialEdges,
  socialGroups,
  notifications,
  traceSteps,
  approvalSteps,
} from './showcase-interactive-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

/** Sub-section: Agents, Data & Visualization interactive components. */
export function ShowcaseInteractiveAgents() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
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

      <ComponentDoc entry={entry('mn-social-graph')} example={`<MnSocialGraph nodes={nodes} edges={edges} groups={groups} />`}>
        <MnSocialGraph nodes={socialNodes} edges={socialEdges} groups={socialGroups} showLabels />
      </ComponentDoc>

      <ComponentDoc
        entry={entry('mn-progress-ring')}
        props={COMPONENT_PROPS['mn-progress-ring']}
        example={`<MnProgressRing value={87} size="lg" variant="primary" label="Completion" />`}
      >
        <div className="flex items-center gap-4">
          <MnProgressRing value={87} size="lg" variant="primary" label="Completion" />
          <MnProgressRing value={42} size="md" variant="muted" label="Adoption" />
          <MnProgressRing value={100} size="sm" variant="success" label="Tests" />
        </div>
      </ComponentDoc>

      <ComponentDoc entry={entry('mn-notification-center')} example={`<MnNotificationCenter open={open} onOpenChange={setOpen} notifications={notifs} />`}>
        <button onClick={() => setNotifOpen(true)} className="px-3 py-1.5 rounded border text-sm">
          Open Notifications ({notifications.filter(n => !n.read).length} unread)
        </button>
        <MnNotificationCenter open={notifOpen} onOpenChange={setNotifOpen} notifications={notifications} />
      </ComponentDoc>

      <ComponentDoc entry={entry('mn-streaming-text')} example={`<MnStreamingText text="Hello world" streaming processMarkdown />`}>
        <MnStreamingText
          text="The orchestration engine dispatched **3 agents** to handle the incoming request. Each agent processes a distinct subtask: *reasoning*, *tool invocation*, and *response synthesis*."
          streaming={false}
          typingCursor={false}
          processMarkdown
        />
      </ComponentDoc>

      <div className="md:col-span-2">
        <ComponentDoc entry={entry('mn-agent-trace')} example={`<MnAgentTrace steps={steps} />`}>
          <MnAgentTrace steps={traceSteps} ariaLabel="Agent execution trace" />
        </ComponentDoc>
      </div>

      <div className="md:col-span-2">
        <ComponentDoc entry={entry('mn-approval-chain')} example={`<MnApprovalChain steps={steps} orientation="horizontal" />`}>
          <MnApprovalChain steps={approvalSteps} orientation="horizontal" />
        </ComponentDoc>
      </div>

      <div className="md:col-span-2">
        <ComponentDoc entry={entry('mn-process-timeline')} example={`<MnProcessTimeline steps={steps} showActors showDuration />`}>
          <MnProcessTimeline
            steps={[
              { id: "1", label: "Request", status: "done", actor: { name: "Student" }, duration: "2m" },
              { id: "2", label: "Review", status: "done", actor: { name: "Admin", color: "var(--mn-info)" }, duration: "1h" },
              { id: "3", label: "Approval", status: "active", actor: { name: "Dean", color: "var(--mn-warning)" } },
              { id: "4", label: "Enrollment", status: "pending", actor: { name: "System" } },
            ]}
            showActors
            showDuration
            animate
          />
        </ComponentDoc>
      </div>

      <ComponentDoc
        entry={entry('mn-modal')}
        props={COMPONENT_PROPS['mn-modal']}
        example={`<MnModal open={open} onOpenChange={setOpen} title="Confirm">\n  <p>Content</p>\n</MnModal>`}
      >
        <button onClick={() => setModalOpen(true)} className="px-3 py-1.5 rounded border text-sm">
          Open Modal
        </button>
        <MnModal open={modalOpen} onOpenChange={setModalOpen} title="Confirm Deployment">
          <p className="text-sm mb-4">Deploy agent <strong>Orchestrator v2.4</strong> to production? This will replace the current version across all mesh nodes.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded border text-sm">Cancel</button>
            <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm">Deploy</button>
          </div>
        </MnModal>
      </ComponentDoc>

      <ComponentDoc entry={entry('mn-state-scaffold')} example={`<MnStateScaffold state="loading" />`}>
        <div className="grid grid-cols-2 gap-2">
          <MnStateScaffold state="loading" className="border rounded p-2" />
          <MnStateScaffold state="empty" message="No agents found" className="border rounded p-2" />
          <MnStateScaffold state="error" message="Connection failed" onRetry={() => {}} className="border rounded p-2" />
          <MnStateScaffold state="ready" className="border rounded p-2">
            <p className="text-sm text-center py-4">Content loaded</p>
          </MnStateScaffold>
        </div>
      </ComponentDoc>

      <div className="md:col-span-2">
        <ComponentDoc
          entry={entry('mn-toast')}
          props={COMPONENT_PROPS['mn-toast']}
          example={`toast.success('Agent deployed successfully')`}
        >
          <MnToast />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => toast.success('Agent deployed successfully')} className="px-3 py-1.5 rounded border text-sm">Success</button>
            <button onClick={() => toast.error('Deployment failed: timeout')} className="px-3 py-1.5 rounded border text-sm">Error</button>
            <button onClick={() => toast.warning('High memory usage detected')} className="px-3 py-1.5 rounded border text-sm">Warning</button>
            <button onClick={() => toast.info('New model version available')} className="px-3 py-1.5 rounded border text-sm">Info</button>
          </div>
        </ComponentDoc>
      </div>
    </>
  );
}
