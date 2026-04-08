'use client';

import {
  MnA11y,
  MnA11yFab,
  MnThemeToggle,
  MnThemeRotary,
} from '@/components/maranello';
import { CATALOG } from '@/lib/component-catalog';
import { ComponentDoc } from './component-doc';

function entry(slug: string) {
  const e = CATALOG.find((c) => c.slug === slug);
  if (!e) throw new Error(`Missing catalog entry: ${slug}`);
  return e;
}

/** Sub-section: Theme & Accessibility controls. */
export function ShowcaseInteractiveTheme() {
  return (
    <>
      <ComponentDoc
        entry={entry('mn-theme-toggle')}
        example={`<MnThemeToggle size="md" showLabel />`}
      >
        <div className="flex items-center gap-4">
          <MnThemeToggle size="sm" />
          <MnThemeToggle size="md" />
          <MnThemeToggle size="lg" />
          <MnThemeToggle showLabel />
        </div>
      </ComponentDoc>

      <ComponentDoc
        entry={entry('mn-theme-rotary')}
        example={`<MnThemeRotary size="md" />`}
      >
        <div className="flex justify-center py-4">
          <MnThemeRotary size="md" />
        </div>
      </ComponentDoc>

      <ComponentDoc
        entry={entry('mn-a11y')}
        example={`<MnA11y />`}
      >
        <MnA11y className="relative bottom-auto right-auto z-auto" />
      </ComponentDoc>

      <ComponentDoc
        entry={entry('mn-a11y-fab')}
        example={`<MnA11yFab />`}
      >
        <p className="text-xs text-muted-foreground mb-2">
          The framework includes one global FAB in the shell. This inline preview shows the same control without duplicating the floating button.
        </p>
        <MnA11yFab position="inline" />
      </ComponentDoc>
    </>
  );
}
