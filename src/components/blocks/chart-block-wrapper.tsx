import { lazy, Suspense } from "react";
import type { ChartBlock } from "@/types";

const MnChart = lazy(() =>
  import("@/components/maranello/data-viz/mn-chart").then((m) => ({ default: m.MnChart })),
);

/**
 * Wrapper that remaps ChartBlock config props to MnChart props.
 * ChartBlock uses `chartType` to avoid shadowing the block `type` field;
 * MnChart expects `type` as the chart variant (line, bar, area, etc.).
 */
export function ChartBlockWrapper({ type: _blockType, chartType, ...rest }: ChartBlock) {
  return (
    <Suspense fallback={<div className="animate-pulse rounded-lg bg-[var(--mn-surface-sunken)] h-32" />}>
      <MnChart type={chartType} {...rest} />
    </Suspense>
  );
}
