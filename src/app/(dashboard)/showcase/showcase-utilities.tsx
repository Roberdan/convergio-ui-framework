'use client';

import { useState } from 'react';
import {
  MnSpinner,
  MnStepper,
  MnToggleSwitch,
  MnDropdownMenu,
  MnDropdownItem,
  MnDropdownSeparator,
  MnDropdownLabel,
  MnCalendarRange,
} from '@/components/maranello';
import type { DateRange } from '@/components/maranello';
import { stepperSteps } from './showcase-data';

/** Section: W1 Accessibility + Utilities components. */
export function ShowcaseUtilities() {
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2026-03-01',
    end: '2026-04-01',
  });

  return (
    <section aria-labelledby="section-utilities">
      <h2 id="section-utilities" className="text-lg font-semibold mb-4">
        W1 — Utilities
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spinners */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnSpinner</h3>
          <div className="flex items-center gap-4">
            <MnSpinner size="sm" variant="primary" label="Loading" />
            <MnSpinner size="md" variant="muted" label="Processing" />
            <MnSpinner size="lg" variant="destructive" label="Error state" />
          </div>
        </div>

        {/* Toggles */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnToggleSwitch</h3>
          <div className="flex flex-col gap-2">
            <MnToggleSwitch checked={toggleA} onCheckedChange={setToggleA} label="Auto-deploy" />
            <MnToggleSwitch checked={toggleB} onCheckedChange={setToggleB} label="Reduced motion" size="sm" />
          </div>
        </div>

        {/* Stepper */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnStepper</h3>
          <MnStepper steps={stepperSteps} currentStep={currentStep} onChange={setCurrentStep} />
        </div>

        {/* Dropdown */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnDropdownMenu</h3>
          <MnDropdownMenu trigger={<span className="px-3 py-1.5 rounded border text-sm">Actions</span>}>
            <MnDropdownLabel>Plan Operations</MnDropdownLabel>
            <MnDropdownItem onSelect={() => {}}>Start execution</MnDropdownItem>
            <MnDropdownItem onSelect={() => {}}>Pause all agents</MnDropdownItem>
            <MnDropdownSeparator />
            <MnDropdownItem onSelect={() => {}}>Export report</MnDropdownItem>
          </MnDropdownMenu>
        </div>

        {/* Calendar Range */}
        <div className="rounded-lg border p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnCalendarRange</h3>
          <MnCalendarRange value={dateRange} onChange={setDateRange} startLabel="Sprint start" endLabel="Sprint end" />
        </div>
      </div>
    </section>
  );
}
