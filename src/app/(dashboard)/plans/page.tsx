import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Plans — Convergio' };

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Plans & Tasks</h1>
        <MnBadge tone="info">Coming in Fase 4</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Plan execution tree, task status, evidence gates, reaper monitoring.
      </p>
    </div>
  );
}
