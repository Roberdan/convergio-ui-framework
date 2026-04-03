import { AppShell } from "@/components/shell/app-shell";
import { loadAppConfig } from "@/lib/config-loader";
import type { NavSection } from "@/types";

const sections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { id: "home", label: "Home", href: "/", iconName: "Home" },
      { id: "showcase", label: "Showcase", href: "/showcase", iconName: "Layout" },
      { id: "themes", label: "Themes", href: "/showcase/themes", iconName: "Palette" },
    ],
  },
  {
    label: "Categories",
    items: [
      { id: "agentic", label: "Agentic AI", href: "/showcase/agentic", iconName: "Brain" },
      { id: "data-display", label: "Data Display", href: "/showcase/data-display", iconName: "Table" },
      { id: "data-viz", label: "Data Viz", href: "/showcase/data-viz", iconName: "BarChart3" },
      { id: "feedback", label: "Feedback", href: "/showcase/feedback", iconName: "MessageSquare" },
      { id: "financial", label: "Financial", href: "/showcase/financial", iconName: "DollarSign" },
      { id: "forms", label: "Forms", href: "/showcase/forms", iconName: "FormInput" },
      { id: "layout", label: "Layout", href: "/showcase/layout", iconName: "Layout" },
      { id: "navigation", label: "Navigation", href: "/showcase/navigation", iconName: "Navigation" },
      { id: "network", label: "Network", href: "/showcase/network", iconName: "Network" },
      { id: "ops", label: "Operations", href: "/showcase/ops", iconName: "Settings" },
      { id: "strategy", label: "Strategy", href: "/showcase/strategy", iconName: "Target" },
      { id: "theme-ctrl", label: "Theme Controls", href: "/showcase/theme", iconName: "Palette" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const appConfig = loadAppConfig();

  return (
    <AppShell sections={sections} brandName={appConfig.name} brandLogo={appConfig.logo}>
      {children}
    </AppShell>
  );
}
