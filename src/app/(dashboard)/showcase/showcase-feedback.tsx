'use client';

import { useState } from 'react';
import {
  MnActivityFeed,
  MnModal,
  MnNotificationCenter,
  MnStateScaffold,
  MnStreamingText,
  MnToast,
  toast,
} from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';
import { notifications, traceSteps } from './showcase-interactive-data';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

const activityItems = traceSteps.map((step, index) => ({
  agent: step.kind === 'handoff' ? 'Coordinator' : step.kind === 'tool' ? 'Tooling' : 'System',
  action: step.label,
  target: step.output ?? step.input ?? 'Background task',
  timestamp: `2026-04-08T1${index}:2${index}:00.000Z`,
  priority: index === 0 ? ('high' as const) : ('normal' as const),
}));

export function ShowcaseFeedback() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section aria-labelledby="section-feedback">
      <h2 id="section-feedback" className="mb-4 text-lg font-semibold">
        Feedback & State
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-activity-feed')} example={`<MnActivityFeed items={items} refreshInterval={0} />`}>
            <MnActivityFeed items={activityItems} refreshInterval={0} ariaLabel="Framework activity feed" />
          </ComponentDoc>
        </div>

        <ComponentDoc entry={entry('mn-notification-center')} example={`<MnNotificationCenter open={open} onOpenChange={setOpen} notifications={notifs} />`}>
          <button onClick={() => setNotifOpen(true)} className="rounded border px-3 py-1.5 text-sm">
            Open Notifications ({notifications.filter((n) => !n.read).length} unread)
          </button>
          <MnNotificationCenter open={notifOpen} onOpenChange={setNotifOpen} notifications={notifications} />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-streaming-text')} example={`<MnStreamingText text="Hello world" processMarkdown />`}>
          <MnStreamingText
            text="The framework is streaming **demo-safe content** with readable pacing, semantic formatting, and no blank placeholder regions."
            streaming={false}
            typingCursor={false}
            processMarkdown
          />
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-modal')} example={`<MnModal open={open} onOpenChange={setOpen} title="Confirm" />`}>
          <button onClick={() => setModalOpen(true)} className="rounded border px-3 py-1.5 text-sm">
            Open Modal
          </button>
          <MnModal open={modalOpen} onOpenChange={setModalOpen} title="Confirm Deployment">
            <p className="mb-4 text-sm">
              Deploy the new preset explorer to production? This keeps keyboard states and theme handling intact.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded border px-3 py-1.5 text-sm">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground">Deploy</button>
            </div>
          </MnModal>
        </ComponentDoc>

        <ComponentDoc entry={entry('mn-state-scaffold')} example={`<MnStateScaffold state="loading" />`}>
          <div className="grid grid-cols-2 gap-2">
            <MnStateScaffold state="loading" className="rounded border p-2" />
            <MnStateScaffold state="empty" message="No demo alerts yet" className="rounded border p-2" />
            <MnStateScaffold state="error" message="Connection failed" onRetry={() => {}} className="rounded border p-2" />
            <MnStateScaffold state="ready" className="rounded border p-2">
              <p className="py-4 text-center text-sm">Content loaded</p>
            </MnStateScaffold>
          </div>
        </ComponentDoc>

        <div className="md:col-span-2">
          <ComponentDoc entry={entry('mn-toast')} example={`toast.success('Preset saved')`}>
            <MnToast />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => toast.success('Preset saved successfully')} className="rounded border px-3 py-1.5 text-sm">Success</button>
              <button onClick={() => toast.error('Save failed: network timeout')} className="rounded border px-3 py-1.5 text-sm">Error</button>
              <button onClick={() => toast.warning('Accessibility review still pending')} className="rounded border px-3 py-1.5 text-sm">Warning</button>
              <button onClick={() => toast.info('New framework preset available')} className="rounded border px-3 py-1.5 text-sm">Info</button>
            </div>
          </ComponentDoc>
        </div>
      </div>
    </section>
  );
}
