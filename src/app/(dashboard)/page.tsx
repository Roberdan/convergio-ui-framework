import { PageRenderer } from "@/components/page-renderer";
import { loadPageConfig } from "@/lib/config-loader";

/**
 * Dashboard page — rendered from convergio.yaml.
 * Edit the `pages["/"]` section in convergio.yaml to change the content.
 */
export default function DashboardPage() {
  const config = loadPageConfig("/");
  if (!config) return null;
  return <PageRenderer config={config} />;
}
