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
} from '@/components/maranello';
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

/** Sub-section: Agents, Data & Visualization interactive components. */
export function ShowcaseInteractiveAgents() {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      {/* User Table */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-medium text-muted-foreground">MnUserTable</h3>
        <MnUserTable users={adminUsers} searchable selectable={false} />
      </div>

      {/* Source Cards */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-medium text-muted-foreground">MnSourceCards</h3>
        <MnSourceCards cards={sourceCards} layout="grid" ariaLabel="Knowledge base results" />
      </div>

      {/* Social Graph */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">MnSocialGraph</h3>
        <MnSocialGraph
          nodes={socialNodes}
          edges={socialEdges}
          groups={socialGroups}
          showLabels
        />
      </div>

      {/* Progress Ring */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">MnProgressRing</h3>
        <div className="flex items-center gap-4">
          <MnProgressRing value={87} size="lg" variant="primary" label="Completion" />
          <MnProgressRing value={42} size="md" variant="muted" label="Adoption" />
          <MnProgressRing value={100} size="sm" variant="success" label="Tests" />
        </div>
      </div>

      {/* Notification Center */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">MnNotificationCenter</h3>
        <button
          onClick={() => setNotifOpen(true)}
          className="px-3 py-1.5 rounded border text-sm"
        >
          Open Notifications ({notifications.filter(n => !n.read).length} unread)
        </button>
        <MnNotificationCenter
          open={notifOpen}
          onOpenChange={setNotifOpen}
          notifications={notifications}
        />
      </div>

      {/* Streaming Text */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">MnStreamingText</h3>
        <MnStreamingText
          text="The orchestration engine dispatched **3 agents** to handle the incoming request. Each agent processes a distinct subtask: *reasoning*, *tool invocation*, and *response synthesis*."
          streaming={false}
          typingCursor={false}
          processMarkdown
        />
      </div>

      {/* Agent Trace */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-medium text-muted-foreground">MnAgentTrace</h3>
        <MnAgentTrace steps={traceSteps} ariaLabel="Agent execution trace" />
      </div>

      {/* Approval Chain */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
        <h3 className="text-sm font-medium text-muted-foreground">MnApprovalChain</h3>
        <MnApprovalChain steps={approvalSteps} orientation="horizontal" />
      </div>
    </>
  );
}
