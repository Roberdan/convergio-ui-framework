'use client';

import {
  MnBadge, MnAvatar, MnAvatarGroup, MnBreadcrumb,
  MnFormField, MnStateScaffold, MnTabs, MnTabList, MnTab, MnTabPanel,
  MnModal, toast,
} from '@/components/maranello';
import { useState } from 'react';
import { breadcrumbItems } from './components-data';

function Card({ name, desc, children }: { name: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SectionPrimitives() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-badge" desc="Semantic status labels with five tones">
        <div className="flex flex-wrap gap-2">
          <MnBadge tone="success" label="Operational" />
          <MnBadge tone="warning" label="At Risk" />
          <MnBadge tone="danger" label="Outage" />
          <MnBadge tone="info" label="Deploying" />
          <MnBadge tone="neutral" label="Archived" />
        </div>
      </Card>

      <Card name="mn-avatar" desc="User avatars with initials and status indicators">
        <div className="flex items-center gap-4">
          <MnAvatar initials="RD" status="online" size="lg" alt="Roberto D'Angelo" />
          <MnAvatar initials="AL" status="busy" alt="Ali" />
          <MnAvatar initials="RX" status="away" size="sm" alt="Rex" />
          <MnAvatarGroup max={3}>
            <MnAvatar initials="SA" alt="Sara" />
            <MnAvatar initials="LC" alt="Luca" />
            <MnAvatar initials="MR" alt="Marco" />
            <MnAvatar initials="JV" alt="Jarvis" />
          </MnAvatarGroup>
        </div>
      </Card>

      <Card name="mn-breadcrumb" desc="Navigation trail with clickable links">
        <MnBreadcrumb items={breadcrumbItems} />
      </Card>

      <Card name="mn-form-field" desc="Form field with label, hint, and validation">
        <div className="space-y-3 max-w-xs">
          <MnFormField label="Agent Name" hint="Unique identifier" fieldId="agent-name" required>
            <input type="text" defaultValue="Ali" className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm" />
          </MnFormField>
          <MnFormField label="Model" error="Required field" fieldId="model-select">
            <input type="text" className="w-full rounded-md border border-destructive bg-background px-3 py-1.5 text-sm" />
          </MnFormField>
        </div>
      </Card>

      <Card name="mn-state-scaffold" desc="Manages loading, empty, error, partial, and ready states">
        <div className="grid grid-cols-2 gap-2">
          <MnStateScaffold state="loading" />
          <MnStateScaffold state="empty" message="No agents registered" actionLabel="Register" onAction={() => {}} />
          <MnStateScaffold state="error" message="Connection refused" onRetry={() => {}} />
          <MnStateScaffold state="ready"><p className="text-sm text-foreground">Content loaded</p></MnStateScaffold>
        </div>
      </Card>

      <Card name="mn-toast" desc="Notification toasts with four variants">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => toast.success('Deployment completed')} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs text-white">Success</button>
          <button onClick={() => toast.error('Build failed on M1Pro')} className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white">Error</button>
          <button onClick={() => toast.warning('Mesh latency above threshold')} className="rounded-md bg-amber-600 px-3 py-1.5 text-xs text-white">Warning</button>
          <button onClick={() => toast.info('Agent Rex registered')} className="rounded-md bg-sky-600 px-3 py-1.5 text-xs text-white">Info</button>
        </div>
      </Card>

      <Card name="mn-tabs" desc="Tabbed content with keyboard navigation">
        <MnTabs defaultValue="overview">
          <MnTabList>
            <MnTab value="overview">Overview</MnTab>
            <MnTab value="metrics">Metrics</MnTab>
            <MnTab value="config">Configuration</MnTab>
          </MnTabList>
          <MnTabPanel value="overview"><p className="text-sm text-muted-foreground">Platform overview with 12 active agents</p></MnTabPanel>
          <MnTabPanel value="metrics"><p className="text-sm text-muted-foreground">847 tasks completed this week</p></MnTabPanel>
          <MnTabPanel value="config"><p className="text-sm text-muted-foreground">Daemon v19.4.0 on port 8420</p></MnTabPanel>
        </MnTabs>
      </Card>

      <Card name="mn-modal" desc="Accessible dialog with focus trap and backdrop">
        <button onClick={() => setModalOpen(true)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Open Modal
        </button>
        <MnModal open={modalOpen} onOpenChange={setModalOpen} title="Agent Configuration">
          <p className="text-sm">Configure agent parameters for the Convergio deployment pipeline. Changes require daemon restart.</p>
        </MnModal>
      </Card>
    </div>
  );
}
