'use client';

import { ShowcaseInteractiveAgents } from './showcase-interactive-agents';
import { ShowcaseInteractiveControls } from './showcase-interactive-controls';

/** Section: Interactive, Admin & Layout components. */
export function ShowcaseInteractive() {
  return (
    <section aria-labelledby="section-interactive">
      <h2 id="section-interactive" className="text-lg font-semibold mb-4">
        Interactive & Admin
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ShowcaseInteractiveAgents />
        <ShowcaseInteractiveControls />
      </div>
    </section>
  );
}
