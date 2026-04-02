'use client';

import { cn } from '@/lib/utils';
import { MnBinnacle } from './mn-binnacle';
import { MnDashboardStrip } from './mn-dashboard-strip';

import type { BinnacleEntry } from './mn-binnacle';
import type { StripMetric } from './mn-dashboard-strip';

export interface MnInstrumentBinnacleProps {
  entries: BinnacleEntry[];
  metrics: StripMetric[];
  /** Max log entries to display. Default: 50 */
  maxVisible?: number;
  ariaLabel?: string;
  className?: string;
}

/**
 * Combined instrument panel: metrics strip + event log.
 *
 * Composes MnDashboardStrip (top) and MnBinnacle (bottom)
 * in a unified view for operational dashboards.
 */
export function MnInstrumentBinnacle({
  entries,
  metrics,
  maxVisible = 50,
  ariaLabel = 'Instrument panel',
  className,
}: MnInstrumentBinnacleProps) {
  return (
    <div
      className={cn('space-y-3', className)}
      role="region"
      aria-label={ariaLabel}
    >
      <MnDashboardStrip
        metrics={metrics}
        ariaLabel="Key metrics"
      />
      <MnBinnacle
        entries={entries}
        maxVisible={maxVisible}
        ariaLabel="Event log"
      />
    </div>
  );
}
