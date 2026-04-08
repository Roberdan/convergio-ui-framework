import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import {
  CATEGORIES,
  TOTAL_COMPONENTS,
  TOTAL_CATEGORIES,
  TOTAL_THEMES,
} from './showcase/category-registry';
import { ShowcaseLandingClient } from './showcase/showcase-landing-client';

const STATS = [
  { label: 'Components', value: TOTAL_COMPONENTS },
  { label: 'Categories', value: TOTAL_CATEGORIES },
  { label: 'Themes', value: TOTAL_THEMES },
] as const;

const GITHUB_URL = 'https://github.com/Roberdan/convergio-frontend';

export default function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero */}
      <section className="space-y-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Open Source
          </span>
          <span className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            MIT License
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Convergio Frontend <span className="text-primary">Framework</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          A config-driven product shell and premium component framework for agentic applications.
          Explore {TOTAL_COMPONENTS}+ production-ready components across {TOTAL_CATEGORIES} categories,
          surfaced as real cockpit-grade product compositions.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1">6 themes</span>
          <span className="rounded-full border px-3 py-1">32 web components</span>
          <span className="rounded-full border px-3 py-1">WCAG 2.2 AA</span>
          <span className="rounded-full border px-3 py-1">Seeded demo data</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/showcase/cockpit"
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore cockpit
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </section>

      {/* Stats */}
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4 text-center">
            <p className="text-3xl font-bold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Presets CTA */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Get started
            </p>
            <h2 className="text-2xl font-semibold">Starter presets and cockpit instruments</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Explore opinionated, accessibility-first starting points for workspace,
              ops, and executive surfaces — plus the full Ferrari Luce-inspired cockpit
              with animated gauges, dashboard strip, instrument binnacle, and heatmaps.
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
        <h2 className="mb-6 text-xl font-semibold">Browse by Category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/showcase/${cat.slug}`}
                className="group rounded-lg border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium transition-colors group-hover:text-primary">
                      {cat.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {cat.count} components
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick preview */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Quick Preview</h2>
          <Link href="/showcase/themes" className="text-sm text-primary hover:underline">
            Theme Playground
          </Link>
        </div>
        <ShowcaseLandingClient />
      </section>
    </div>
  );
}
