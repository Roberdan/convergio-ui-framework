"use client";

import { MnSwot } from "@/components/maranello";

export function StrategySwot() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-4">
      <MnSwot
        strengths={[
          "Multi-agent orchestration capability",
          "Real-time mesh networking",
          "Comprehensive API coverage (200+ endpoints)",
          "Design system with 63 components",
        ]}
        weaknesses={[
          "Single-node deployment model",
          "Limited offline capabilities",
          "Complex initial setup",
        ]}
        opportunities={[
          "Growing demand for AI orchestration",
          "Enterprise automation market",
          "Multi-cloud deployment",
          "Edge computing integration",
        ]}
        threats={[
          "Rapid LLM provider changes",
          "Open-source competition",
          "Vendor lock-in concerns",
          "Regulatory compliance requirements",
        ]}
        ariaLabel="Platform SWOT analysis"
      />
    </div>
  );
}
