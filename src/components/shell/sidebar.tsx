"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { SidebarNav } from "./sidebar-nav";

/* ── Public types ── */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: number;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface SidebarProps {
  sections: NavSection[];
  collapsed: boolean;
  onToggle: () => void;
  brandName?: string;
}

/* ── Media query hook ── */

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return mobile;
}

/* ── Footer section ── */

const footerSection: NavSection = {
  label: "Support",
  items: [
    { id: "settings", label: "Settings", href: "/settings", iconName: "Settings" },
    { id: "help", label: "Help", href: "/help", iconName: "HelpCircle" },
  ],
};

/* ── Shared sidebar content (brand + nav + footer) ── */

function SidebarInner({
  sections,
  collapsed,
  brandName,
}: {
  sections: NavSection[];
  collapsed: boolean;
  brandName: string;
}) {
  return (
    <>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border px-4",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? (
          <span className="font-heading text-lg font-bold text-sidebar-primary">
            {brandName.charAt(0)}
          </span>
        ) : (
          <span className="font-heading text-lg font-semibold tracking-tight text-sidebar-foreground">
            {brandName}
          </span>
        )}
      </div>
      <SidebarNav sections={sections} collapsed={collapsed} />
      <div className="border-t border-sidebar-border">
        <SidebarNav sections={[footerSection]} collapsed={collapsed} />
      </div>
    </>
  );
}

/* ── Collapse toggle ── */

function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const classes = cn(
    "flex items-center justify-center rounded-md p-2",
    "text-sidebar-foreground hover:bg-sidebar-accent",
    "hover:text-sidebar-accent-foreground transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-sidebar-ring"
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onToggle}
              aria-label={label}
              className={classes}
            />
          }
        >
          <Icon className="size-5" />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={classes}
    >
      <Icon className="size-5" />
    </button>
  );
}

/* ── Main Sidebar ── */

export function Sidebar({
  sections,
  collapsed,
  onToggle,
  brandName = "Convergio",
}: SidebarProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col",
          "h-[calc(100vh-52px)] sticky top-[52px] overflow-hidden",
          "bg-sidebar text-sidebar-foreground",
          "border-r border-sidebar-border",
          "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarInner
          sections={sections}
          collapsed={collapsed}
          brandName={brandName}
        />
        <div
          className={cn(
            "flex border-t border-sidebar-border p-3",
            collapsed ? "justify-center" : "justify-end"
          )}
        >
          <CollapseToggle collapsed={collapsed} onToggle={onToggle} />
        </div>
      </aside>

      {/* Mobile sheet overlay */}
      {isMobile && (
        <Sheet
          open={!collapsed}
          onOpenChange={(open) => {
            if (!open) onToggle();
          }}
        >
          <SheetContent
            side="left"
            className="gap-0 bg-sidebar p-0 text-sidebar-foreground"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{brandName}</SheetTitle>
            </SheetHeader>
            <SidebarInner
              sections={sections}
              collapsed={false}
              brandName={brandName}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
