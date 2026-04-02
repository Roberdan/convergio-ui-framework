"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MnDropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}

/**
 * Maranello-styled dropdown menu.
 * Keyboard navigable (Arrow keys, Enter, Escape) and screen reader friendly.
 */
function MnDropdownMenu({
  trigger,
  children,
  align = "start",
  className,
}: MnDropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemsRef = React.useRef<HTMLButtonElement[]>([]);
  const menuId = React.useId();

  /* Close on Escape or outside click */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  /* Focus first item on open */
  React.useEffect(() => {
    if (open) itemsRef.current[0]?.focus();
  }, [open]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    const items = itemsRef.current.filter(Boolean);
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <div ref={menuRef} className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center outline-none"
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleKeyNav}
          className={cn(
            "absolute z-50 mt-1 min-w-[10rem] rounded-lg border border-border bg-popover p-1 shadow-lg",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <MnMenuContext.Provider
            value={{
              register: (el) => {
                if (el && !itemsRef.current.includes(el)) {
                  itemsRef.current.push(el);
                }
              },
              close: () => {
                setOpen(false);
                triggerRef.current?.focus();
              },
            }}
          >
            {children}
          </MnMenuContext.Provider>
        </div>
      )}
    </div>
  );
}

const MnMenuContext = React.createContext<{
  register: (el: HTMLButtonElement | null) => void;
  close: () => void;
}>({ register: () => {}, close: () => {} });

interface MnDropdownItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
  className?: string;
}

function MnDropdownItem({
  children,
  onSelect,
  disabled = false,
  variant = "default",
  className,
}: MnDropdownItemProps) {
  const { register, close } = React.useContext(MnMenuContext);
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    register(ref.current);
  }, [register]);

  return (
    <button
      ref={ref}
      role="menuitem"
      disabled={disabled}
      tabIndex={-1}
      onClick={() => {
        onSelect?.();
        close();
      }}
      className={cn(
        "flex w-full items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        variant === "destructive" && "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

function MnDropdownSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn("my-1 h-px bg-border", className)}
    />
  );
}

function MnDropdownLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-2 py-1 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export { MnDropdownMenu, MnDropdownItem, MnDropdownSeparator, MnDropdownLabel };
export type { MnDropdownMenuProps, MnDropdownItemProps };
