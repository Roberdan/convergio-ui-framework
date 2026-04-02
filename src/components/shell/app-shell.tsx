"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, type NavSection } from "./sidebar";
import { Header } from "./header";
import { CommandMenu } from "./command-menu";
import { A2UIProvider } from "@/lib/a2ui";
import { A2UIContainer } from "@/components/a2ui";

export interface AppShellProps {
  children: React.ReactNode;
  sections: NavSection[];
  brandName?: string;
}

export function AppShell({ children, sections, brandName }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const toggleSidebar = useCallback(() => setCollapsed((c) => !c), []);
  const openCommand = useCallback(() => setCommandOpen(true), []);

  const breadcrumb = buildBreadcrumb(brandName ?? "Convergio", pathname, sections);

  return (
    <A2UIProvider>
      <Header
        onMenuToggle={toggleSidebar}
        onSearchClick={openCommand}
        breadcrumb={breadcrumb}
      />
      <div className="flex pt-[52px]">
        <Sidebar
          sections={sections}
          collapsed={collapsed}
          onToggle={toggleSidebar}
          brandName={brandName}
        />
        <main id="main-content" className="flex-1 min-h-[calc(100vh-52px)] overflow-auto">
          <div className="p-6">
            <A2UIContainer currentPage={pathname} />
            {children}
          </div>
        </main>
      </div>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </A2UIProvider>
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
