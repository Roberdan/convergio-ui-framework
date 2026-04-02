"use client";

import { MnCustomerJourneyMap } from "@/components/maranello";
import type { JourneyStage } from "@/components/maranello";

const stages: JourneyStage[] = [
  {
    name: "Discovery",
    touchpoints: [
      { channel: "Documentation", sentiment: "positive" },
      { channel: "GitHub", sentiment: "positive" },
      { channel: "Community", sentiment: "neutral" },
    ],
  },
  {
    name: "Onboarding",
    touchpoints: [
      { channel: "CLI Install", sentiment: "positive" },
      { channel: "Initial Config", sentiment: "neutral" },
      { channel: "First Plan", sentiment: "positive" },
    ],
  },
  {
    name: "Daily Use",
    touchpoints: [
      { channel: "Dashboard", sentiment: "positive" },
      { channel: "Agent Chat", sentiment: "positive" },
      { channel: "Plan Execution", sentiment: "neutral" },
    ],
  },
  {
    name: "Scaling",
    touchpoints: [
      { channel: "Mesh Setup", sentiment: "neutral" },
      { channel: "Org Management", sentiment: "positive" },
      { channel: "Custom Agents", sentiment: "negative" },
    ],
  },
  {
    name: "Advocacy",
    touchpoints: [
      { channel: "Team Sharing", sentiment: "positive" },
      { channel: "Feature Requests", sentiment: "neutral" },
      { channel: "Contributions", sentiment: "positive" },
    ],
  },
];

export function StrategyJourney() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnCustomerJourneyMap
        stages={stages}
        ariaLabel="Customer journey map"
      />
    </div>
  );
}
