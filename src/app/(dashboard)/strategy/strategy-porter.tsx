"use client";

import { MnPorterFiveForces } from "@/components/maranello";
import type { Force } from "@/components/maranello";

const forces: Force[] = [
  { name: "Threat of New Entrants", level: "high", notes: "Low barriers in AI tooling space" },
  { name: "Bargaining Power of Suppliers", level: "high", notes: "Dependency on LLM providers (OpenAI, Anthropic)" },
  { name: "Bargaining Power of Buyers", level: "medium", notes: "Switching costs moderate due to integration depth" },
  { name: "Threat of Substitutes", level: "medium", notes: "DIY automation, single-agent solutions" },
  { name: "Industry Rivalry", level: "high", notes: "Crowded AI orchestration market" },
];

export function StrategyPorter() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnPorterFiveForces
        forces={forces}
        ariaLabel="Porter five forces analysis"
      />
    </div>
  );
}
