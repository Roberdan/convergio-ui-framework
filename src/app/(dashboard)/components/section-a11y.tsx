'use client';

import { useState } from 'react';
import {
  MnA11yFab, MnSpinner, MnStepper, MnToggleSwitch,
  MnDropdownMenu, MnDropdownItem, MnDropdownSeparator, MnDropdownLabel,
  MnCalendarRange,
} from '@/components/maranello';
import { stepperSteps } from './components-data';

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

export function SectionA11y() {
  const [step, setStep] = useState(1);
  const [autoScale, setAutoScale] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: '2026-03-15',
    end: '2026-04-01',
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card name="mn-a11y-fab" desc="Floating accessibility button with preference panel">
        <p className="text-xs text-muted-foreground">
          The A11y FAB is rendered at bottom-right. Toggle font size, dyslexic font, high contrast, and reduced motion.
        </p>
        <MnA11yFab />
      </Card>

      <Card name="mn-spinner" desc="Loading spinners in three sizes and variants">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <MnSpinner size="sm" variant="primary" />
            <span className="text-xs text-muted-foreground">Small</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MnSpinner size="md" variant="muted" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MnSpinner size="lg" variant="destructive" />
            <span className="text-xs text-muted-foreground">Large</span>
          </div>
        </div>
      </Card>

      <Card name="mn-stepper" desc="Multi-step wizard with progress indication">
        <MnStepper steps={stepperSteps} currentStep={step} onChange={setStep} />
        <div className="mt-3 flex gap-2">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="rounded-md border border-border px-3 py-1 text-xs disabled:opacity-40">Previous</button>
          <button onClick={() => setStep(Math.min(stepperSteps.length - 1, step + 1))} disabled={step === stepperSteps.length - 1}
            className="rounded-md border border-border px-3 py-1 text-xs disabled:opacity-40">Next</button>
        </div>
      </Card>

      <Card name="mn-toggle-switch" desc="Toggle switches with labels">
        <div className="space-y-3">
          <MnToggleSwitch checked={autoScale} onCheckedChange={setAutoScale} label="Auto-scale Agents" />
          <MnToggleSwitch checked={notifications} onCheckedChange={setNotifications} label="Push Notifications" />
        </div>
      </Card>

      <Card name="mn-dropdown-menu" desc="Accessible dropdown menu with keyboard navigation">
        <MnDropdownMenu trigger={
          <span className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted cursor-pointer">
            Actions
          </span>
        }>
          <MnDropdownLabel>Agent Operations</MnDropdownLabel>
          <MnDropdownItem onSelect={() => {}}>Restart Agent</MnDropdownItem>
          <MnDropdownItem onSelect={() => {}}>View Logs</MnDropdownItem>
          <MnDropdownSeparator />
          <MnDropdownItem onSelect={() => {}}>Deregister</MnDropdownItem>
        </MnDropdownMenu>
      </Card>

      <Card name="mn-calendar-range" desc="Date range picker with start/end inputs">
        <div className="max-w-sm">
          <MnCalendarRange
            value={dateRange}
            onChange={setDateRange}
            startLabel="Sprint Start"
            endLabel="Sprint End"
          />
        </div>
      </Card>
    </div>
  );
}
