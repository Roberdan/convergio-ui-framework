'use client';

import {
  MnStrategyCanvas,
  MnSwot,
  MnPorterFiveForces,
  MnCustomerJourneyMap,
  MnBcgMatrix,
  MnBusinessModelCanvas,
  MnNineBoxMatrix,
  MnRiskMatrix,
} from '@/components/maranello';
import {
  strategyCanvasSegments,
  swotData,
  porterForces,
  journeyStages,
  bcgItems,
  bmcBlocks,
  nineBoxItems,
  riskItems,
} from './showcase-strategy-data';

/** Section: W5 Strategy & Business Frameworks. */
export function ShowcaseStrategy() {
  return (
    <section aria-labelledby="section-strategy">
      <h2 id="section-strategy" className="text-lg font-semibold mb-4">
        W5 — Strategy & Business Frameworks
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Canvas */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnStrategyCanvas</h3>
          <MnStrategyCanvas segments={strategyCanvasSegments} ariaLabel="Platform strategy canvas" />
        </div>

        {/* SWOT Analysis */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnSwot</h3>
          <MnSwot
            strengths={swotData.strengths}
            weaknesses={swotData.weaknesses}
            opportunities={swotData.opportunities}
            threats={swotData.threats}
            ariaLabel="Convergio SWOT analysis"
          />
        </div>

        {/* Porter's Five Forces */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnPorterFiveForces</h3>
          <MnPorterFiveForces forces={porterForces} ariaLabel="AI ops market forces" />
        </div>

        {/* Customer Journey Map */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnCustomerJourneyMap</h3>
          <MnCustomerJourneyMap stages={journeyStages} ariaLabel="Enterprise client journey" />
        </div>

        {/* BCG Matrix */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnBcgMatrix</h3>
          <MnBcgMatrix items={bcgItems} height={280} />
        </div>

        {/* Nine Box Matrix */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnNineBoxMatrix</h3>
          <MnNineBoxMatrix
            items={nineBoxItems}
            xLabel="Performance"
            yLabel="Potential"
          />
        </div>

        {/* Risk Matrix */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">MnRiskMatrix</h3>
          <MnRiskMatrix items={riskItems} ariaLabel="Platform risk assessment" />
        </div>

        {/* Business Model Canvas */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">MnBusinessModelCanvas</h3>
          <MnBusinessModelCanvas blocks={bmcBlocks} editable={false} />
        </div>
      </div>
    </section>
  );
}
