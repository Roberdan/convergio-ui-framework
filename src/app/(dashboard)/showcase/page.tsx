import Link from 'next/link';
import {
  CATEGORIES,
  TOTAL_COMPONENTS,
  TOTAL_CATEGORIES,
  TOTAL_THEMES,
} from './category-registry';
import { ShowcaseLandingClient } from './showcase-landing-client';

const STATS = [
  { label: 'Components', value: TOTAL_COMPONENTS },
  { label: 'Categories', value: TOTAL_CATEGORIES },
  { label: 'Themes', value: TOTAL_THEMES },
] as const;

export default function ShowcasePage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero */}
      <section className="space-y-4 py-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Framework explorer
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Convergio Frontend <span className="text-primary">Framework</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          A config-driven product shell and premium component framework for agentic applications.
          Explore {TOTAL_COMPONENTS}+ production-ready components across {TOTAL_CATEGORIES} categories,
          now surfaced as real cockpit-grade product compositions instead of a flat component dump.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1">6 themes</span>
          <span className="rounded-full border px-3 py-1">32 web components</span>
          <span className="rounded-full border px-3 py-1">WCAG 2.2 AA</span>
          <span className="rounded-full border px-3 py-1">Seeded demo data</span>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border bg-card p-4 text-center"
          >
            <p className="text-3xl font-bold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              New focus
            </p>
            <h2 className="text-2xl font-semibold">Starter presets plus the missing wow factor</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Explore three opinionated, accessibility-first starting points for workspace,
              ops, and executive surfaces — built to show product potential, with the richer dashboard
              and hero compositions that the old public demo was better at surfacing.
            </p>
          </div>
          <Link
            href="/showcase/presets"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open preset gallery
          </Link>
        </div>
      </section>

      {/* Category grid */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/showcase/${cat.slug}`}
                className="group rounded-lg border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cat.count} components
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick preview */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Quick Preview</h2>
          <Link
            href="/showcase/themes"
            className="text-sm text-primary hover:underline"
          >
            Theme Playground →
          </Link>
        </div>
        <ShowcaseLandingClient />
      </section>
    </div>
  );
}
