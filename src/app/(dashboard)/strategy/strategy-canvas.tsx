"use client";

import { useState } from "react";
import { MnStrategyCanvas } from "@/components/maranello";
import type { CanvasSegment } from "@/components/maranello";

const defaultSegments: CanvasSegment[] = [
  { label: "Key Partners", items: ["AI providers", "Cloud infrastructure", "Open-source community"] },
  { label: "Key Activities", items: ["Agent orchestration", "Plan execution", "Model inference"] },
  { label: "Key Resources", items: ["Compute clusters", "Model weights", "Domain expertise"] },
  { label: "Value Propositions", items: ["Automated workflows", "AI-native ops", "Multi-agent coordination"] },
  { label: "Customer Relationships", items: ["Self-service platform", "AI copilot", "Community support"] },
  { label: "Channels", items: ["Web platform", "API", "CLI tools"] },
  { label: "Customer Segments", items: ["Dev teams", "Platform engineers", "AI researchers"] },
  { label: "Cost Structure", items: ["Compute costs", "Model licensing", "Engineering"] },
  { label: "Revenue Streams", items: ["Platform subscriptions", "Enterprise licensing", "Support"] },
];

export function StrategyCanvas() {
  const [segments, setSegments] = useState(defaultSegments);

  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnStrategyCanvas
        segments={segments}
        onChange={setSegments}
        ariaLabel="Business model canvas"
      />
    </div>
  );
}
