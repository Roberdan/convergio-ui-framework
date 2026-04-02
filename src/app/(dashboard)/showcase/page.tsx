import { ShowcaseUtilities } from './showcase-utilities';
import { ShowcaseDataViz } from './showcase-dataviz';
import { ShowcaseNetwork } from './showcase-network';
import { ShowcaseAgentic } from './showcase-agentic';

/**
 * Maranello Design System — Component Showcase.
 *
 * Renders every Phase 2 component with realistic sample data.
 * MnA11yFab is auto-included via the root layout and floats globally.
 */
export default function ShowcasePage() {
  return (
    <div className="space-y-12 pb-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Maranello Component Showcase</h1>
        <p className="text-muted-foreground mt-1">
          All Phase 2 components rendered with realistic platform data.
        </p>
      </header>

      <ShowcaseUtilities />
      <ShowcaseDataViz />
      <ShowcaseNetwork />
      <ShowcaseAgentic />

      {/* W5 Strategy — placeholder for upcoming wave */}
      <section aria-labelledby="section-strategy">
        <h2 id="section-strategy" className="text-lg font-semibold mb-4">
          W5 — Strategy (Upcoming)
        </h2>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Strategy components will be added in Wave 5.
        </div>
      </section>

      {/* A2UI — placeholder until MnA2UIStream is implemented */}
      <section aria-labelledby="section-a2ui">
        <h2 id="section-a2ui" className="text-lg font-semibold mb-4">
          A2UI — Agent-to-UI Stream
        </h2>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          MnA2UIStream will be integrated when available.
        </div>
      </section>
    </div>
  );
}
