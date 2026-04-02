import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page-renderer";
import { loadPageConfig, loadPageRoutes } from "@/lib/config-loader";

export const dynamic = "force-dynamic";

interface CatchAllProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Dynamic catch-all page.
 *
 * Reads the route from the URL slug segments, looks up the page
 * config in convergio.yaml, and renders it via PageRenderer.
 * Falls through to 404 if no YAML page config exists for the route.
 */
export default async function CatchAllPage({ params }: CatchAllProps) {
  const { slug } = await params;
  const route = `/${slug.join("/")}`;
  const config = loadPageConfig(route);

  if (!config) return notFound();
  return <PageRenderer config={config} />;
}

/** Pre-generate static params from all YAML-defined page routes. */
export function generateStaticParams() {
  return loadPageRoutes()
    .filter((route) => route !== "/")
    .map((route) => ({
      slug: route.replace(/^\//, "").split("/"),
    }));
}
