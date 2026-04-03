import { ShowcaseUtilities } from './showcase-utilities';
import { ShowcaseDataViz } from './showcase-dataviz';
import { ShowcaseNetwork } from './showcase-network';
import { ShowcaseAgentic } from './showcase-agentic';
import { ShowcaseStrategy } from './showcase-strategy';
import { ShowcaseFinancial } from './showcase-financial';
import { ShowcaseInteractive } from './showcase-interactive';

/**
 * Maranello Design System — Component Showcase.
 *
 * Renders all Maranello components with realistic sample data.
 * MnA11yFab is auto-included via the root layout and floats globally.
 */
export default function ShowcasePage() {
  return (
    <div className="space-y-12 pb-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Maranello Component Showcase</h1>
        <p className="text-muted-foreground mt-1">
          All Maranello components rendered with realistic platform data.
        </p>
      </header>

      <ShowcaseUtilities />
      <ShowcaseDataViz />
      <ShowcaseNetwork />
      <ShowcaseAgentic />
      <ShowcaseStrategy />
      <ShowcaseFinancial />
      <ShowcaseInteractive />
    </div>
  );
}
