import { MnBadge } from '@/components/maranello';

export const metadata = { title: 'Billing — Convergio' };

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Billing</h1>
        <MnBadge tone="info">Coming in Fase 7</MnBadge>
      </div>
      <p className="text-muted-foreground">
        Usage per org, invoices, rate cards, budget hierarchy, settlements.
      </p>
    </div>
  );
}
