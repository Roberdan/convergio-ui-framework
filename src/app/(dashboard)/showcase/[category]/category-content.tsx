'use client';

import { ShowcaseAgentic } from '../showcase-agentic';
import { ShowcaseCockpit } from '../showcase-cockpit';
import { ShowcaseDataDisplay } from '../showcase-data-display';
import { ShowcaseDataViz } from '../showcase-dataviz';
import { ShowcaseFeedback } from '../showcase-feedback';
import { ShowcaseNetwork } from '../showcase-network';
import { ShowcaseTheme } from '../showcase-theme';
import { ShowcaseStrategy } from '../showcase-strategy';
import { ShowcaseFinancial } from '../showcase-financial';
import { ShowcaseUtilities } from '../showcase-utilities';
import { ShowcaseInteractive } from '../showcase-interactive';
import { ShowcaseInteractiveControls } from '../showcase-interactive-controls';
import { ShowcaseAdvancedLayoutNav } from '../showcase-advanced-layout-nav';
import { ShowcaseAdvancedOps } from '../showcase-advanced-ops';

const SECTION_MAP: Record<string, React.ComponentType> = {
  agentic: ShowcaseAgentic,
  cockpit: ShowcaseCockpit,
  'data-display': ShowcaseDataDisplay,
  'data-viz': ShowcaseDataViz,
  feedback: ShowcaseFeedback,
  financial: ShowcaseFinancial,
  forms: ShowcaseInteractiveControls,
  layout: ShowcaseAdvancedLayoutNav,
  navigation: ShowcaseAdvancedLayoutNav,
  network: ShowcaseNetwork,
  ops: ShowcaseAdvancedOps,
  strategy: ShowcaseStrategy,
  theme: ShowcaseTheme,
};

/** Renders the appropriate showcase section for a given category slug. */
export function CategoryContent({ slug }: { slug: string }) {
  const Section = SECTION_MAP[slug];
  if (!Section) return null;
  return <Section />;
}
