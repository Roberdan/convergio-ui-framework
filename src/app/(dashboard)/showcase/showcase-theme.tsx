'use client';

import { ShowcaseInteractiveTheme } from './showcase-interactive-theme';

export function ShowcaseTheme() {
  return (
    <section aria-labelledby="section-theme">
      <h2 id="section-theme" className="mb-4 text-lg font-semibold">
        Theme & Accessibility
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ShowcaseInteractiveTheme />
      </div>
    </section>
  );
}
