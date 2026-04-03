"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconSlot } from "@/lib/icon-slot";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { NavItem, NavSection } from "./sidebar";

function NavItemLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const classes = cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
    "transition-colors duration-150",
    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
    collapsed && "justify-center px-2"
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<Link href={item.href} className={classes} />}
        >
          <IconSlot name={item.iconName} className="size-5 shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
          {item.badge != null && (
            <span className="ml-1.5 opacity-70">({item.badge})</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={item.href} className={classes}>
      <IconSlot name={item.iconName} className="size-5 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge != null && (
        <span
          className={cn(
            "ml-auto inline-flex h-5 min-w-5 items-center justify-center",
            "rounded-full bg-sidebar-primary px-1.5",
            "text-xs font-semibold text-sidebar-primary-foreground"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function SidebarNav({
  sections,
  collapsed,
}: {
  sections: NavSection[];
  collapsed: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.label}>
          {!collapsed && (
            <div className="text-label mb-2 px-3 text-muted-foreground">
              {section.label}
            </div>
          )}
          <ul className="flex flex-col gap-1" role="list">
            {section.items.map((item) => (
              <li key={item.id}>
                <NavItemLink
                  item={item}
                  collapsed={collapsed}
                  isActive={pathname === item.href}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
