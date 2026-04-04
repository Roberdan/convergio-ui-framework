import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Inference — Convergio' };

export default function InferencePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Inference</h1>
        <MnBadge tone="info">Coming in Fase 5</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Model routing, cost tracking, budget alerts, fallback chains.
      </p>
    </div>
  );
}
