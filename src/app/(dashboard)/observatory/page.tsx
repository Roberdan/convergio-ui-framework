import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Observatory — Convergio' };

export default function ObservatoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Observatory</h1>
        <MnBadge tone="info">Coming in Fase 8</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Event timeline, full-text search, dashboards, anomaly detection.
      </p>
    </div>
  );
}
