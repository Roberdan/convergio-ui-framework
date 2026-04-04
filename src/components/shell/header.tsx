"use client";

import { Menu, Bell } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchCombobox } from "./search-combobox";

export interface HeaderProps {
  onMenuToggle: () => void;
  breadcrumb: string[];
}

export function Header({ onMenuToggle, breadcrumb }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-[52px] w-full items-center border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Left zone */}
      <div className="flex items-center gap-2 px-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu className="h-4 w-4" />
        </button>

        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center text-sm">
            <ol className="flex items-center list-none m-0 p-0">
              {breadcrumb.map((segment, i) => (
                <li key={i} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-1.5 text-muted-foreground" aria-hidden="true">
                      &gt;
                    </span>
                  )}
                  <span
                    className={i === 0 ? "font-heading font-semibold" : "font-sans text-muted-foreground"}
                    aria-current={i === breadcrumb.length - 1 ? "page" : undefined}
                  >
                    {segment}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {/* Center zone — inline search combobox */}
      <div className="hidden flex-1 justify-center px-4 md:flex">
        <SearchCombobox />
      </div>

      {/* Spacer when center is hidden on mobile */}
      <div className="flex-1 md:hidden" />

      {/* Right zone */}
      <div className="flex items-center gap-1 px-3">
        <ThemeSwitcher />

        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="h-4 w-4" />
        </button>

        <Avatar size="sm">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            RD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
