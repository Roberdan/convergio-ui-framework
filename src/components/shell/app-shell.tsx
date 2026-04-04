"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, type NavSection } from "./sidebar";
import { Header } from "./header";
import { MnA11yFab } from "@/components/maranello";

export interface AppShellProps {
  children: React.ReactNode;
  sections: NavSection[];
  brandName?: string;
  brandLogo?: string;
}

export function AppShell({ children, sections, brandName, brandLogo }: AppShellProps) {
  const pathname = usePathname();
  // Start collapsed so mobile Sheet is closed on initial render
  const [collapsed, setCollapsed] = useState(true);

  const toggleSidebar = useCallback(() => setCollapsed((c) => !c), []);

  const breadcrumb = buildBreadcrumb(brandName ?? "Maranello", pathname, sections);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
      >
        Skip to main content
      </a>
      <Header
        onMenuToggle={toggleSidebar}
        breadcrumb={breadcrumb}
      />
      <div className="flex pt-[52px]">
        <Sidebar
          sections={sections}
          collapsed={collapsed}
          onToggle={toggleSidebar}
          brandName={brandName}
          brandLogo={brandLogo}
        />
        <main id="main-content" className="flex-1 min-h-[calc(100vh-52px)] overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      <MnA11yFab />
    </>
  );
}

function buildBreadcrumb(brand: string, pathname: string, sections: NavSection[]): string[] {
  if (pathname === "/") return [brand, "Dashboard"];
  for (const section of sections) {
    for (const item of section.items) {
      if (item.href === pathname) return [brand, item.label];
    }
  }
  const slug = pathname.split("/").filter(Boolean).pop() ?? "";
  return [brand, slug.charAt(0).toUpperCase() + slug.slice(1)];
}
