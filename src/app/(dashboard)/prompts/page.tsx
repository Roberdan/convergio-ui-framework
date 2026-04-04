import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Prompt Studio — Convergio' };

export default function PromptsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Prompt Studio</h1>
        <MnBadge tone="info">Coming in Fase 10</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Prompt templates, A/B testing, skill registry, token optimization.
      </p>
    </div>
  );
}
