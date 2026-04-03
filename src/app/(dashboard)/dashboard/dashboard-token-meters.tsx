"use client";

import type { TokenUsage, ModelTokenUsage } from "@/lib/api";
import { MnTokenMeter } from "@/components/maranello";
import type { TokenUsage as MeterTokenUsage } from "@/components/maranello";

interface DashboardTokenMetersProps {
  tokenUsage: TokenUsage[] | null;
  modelTokens: ModelTokenUsage[] | null;
}

function aggregateDailyTokens(usage: TokenUsage[]): MeterTokenUsage {
  const totals = usage.reduce(
    (acc, day) => ({
      prompt: acc.prompt + day.input,
      completion: acc.completion + day.output,
    }),
    { prompt: 0, completion: 0 },
  );
  return totals;
}

function modelToMeterUsage(model: ModelTokenUsage): MeterTokenUsage {
  return {
    prompt: model.prompt,
    completion: model.completion,
    cached: model.cached,
    budget: model.budget,
    costPerMToken: model.costPerMToken,
  };
}

export function DashboardTokenMeters({
  tokenUsage,
  modelTokens,
}: DashboardTokenMetersProps) {
  const hasDaily = Array.isArray(tokenUsage) && tokenUsage.length > 0;
  const hasModels = Array.isArray(modelTokens) && modelTokens.length > 0;

  if (!hasDaily && !hasModels) return null;

  const dailyAggregate = hasDaily ? aggregateDailyTokens(tokenUsage) : undefined;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-heading uppercase tracking-wider text-muted-foreground mb-4">
        Token Usage
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dailyAggregate && (
          <MnTokenMeter
            usage={dailyAggregate}
            label="Aggregate (All Models)"
            showBreakdown
            size="md"
          />
        )}
        {hasModels &&
          modelTokens.map((model) => (
            <MnTokenMeter
              key={model.model}
              usage={modelToMeterUsage(model)}
              label={model.model}
              showCost={model.costPerMToken !== undefined}
              showBreakdown
              size="sm"
            />
          ))}
      </div>
    </div>
  );
}
