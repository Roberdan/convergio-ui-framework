"use client";

import {
  MnStrategyCanvas,
  MnSwot,
  MnPorterFiveForces,
  MnCustomerJourneyMap,
  MnDecisionMatrix,
  MnTabs,
  MnTabList,
  MnTab,
  MnTabPanel,
} from "@/components/maranello";
import { StrategySwot } from "./strategy-swot";
import { StrategyCanvas } from "./strategy-canvas";
import { StrategyPorter } from "./strategy-porter";
import { StrategyJourney } from "./strategy-journey";
import { StrategyDecision } from "./strategy-decision";

export function StrategyClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Strategy</h1>
        <p className="text-caption mt-1">Business frameworks and strategic analysis</p>
      </div>

      <MnTabs defaultValue="canvas">
        <MnTabList>
          <MnTab value="canvas">Strategy Canvas</MnTab>
          <MnTab value="swot">SWOT</MnTab>
          <MnTab value="porter">Porter Five Forces</MnTab>
          <MnTab value="journey">Customer Journey</MnTab>
          <MnTab value="decision">Decision Matrix</MnTab>
        </MnTabList>

        <MnTabPanel value="canvas">
          <StrategyCanvas />
        </MnTabPanel>

        <MnTabPanel value="swot">
          <StrategySwot />
        </MnTabPanel>

        <MnTabPanel value="porter">
          <StrategyPorter />
        </MnTabPanel>

        <MnTabPanel value="journey">
          <StrategyJourney />
        </MnTabPanel>

        <MnTabPanel value="decision">
          <StrategyDecision />
        </MnTabPanel>
      </MnTabs>
    </div>
  );
}
