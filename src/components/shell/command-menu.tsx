"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Brain,
  DollarSign,
  FormInput,
  Home,
  Layout,
  MessageSquare,
  Monitor,
  Moon,
  Navigation,
  Network,
  Palette,
  Settings,
  Shield,
  Sun,
  Table,
  Target,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useTheme } from "@/components/theme/theme-provider"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Showcase", href: "/showcase", icon: Layout },
  { label: "Theme Playground", href: "/showcase/themes", icon: Palette },
] as const

const CATEGORY_ITEMS = [
  { label: "Agentic AI", href: "/showcase/agentic", icon: Brain },
  { label: "Data Display", href: "/showcase/data-display", icon: Table },
  { label: "Data Viz", href: "/showcase/data-viz", icon: BarChart3 },
  { label: "Feedback", href: "/showcase/feedback", icon: MessageSquare },
  { label: "Financial", href: "/showcase/financial", icon: DollarSign },
  { label: "Forms", href: "/showcase/forms", icon: FormInput },
  { label: "Layout", href: "/showcase/layout", icon: Layout },
  { label: "Navigation", href: "/showcase/navigation", icon: Navigation },
  { label: "Network", href: "/showcase/network", icon: Network },
  { label: "Operations", href: "/showcase/ops", icon: Settings },
  { label: "Strategy", href: "/showcase/strategy", icon: Target },
] as const

const THEME_ITEMS = [
  { label: "Light", value: "light" as const, icon: Sun },
  { label: "Dark", value: "dark" as const, icon: Moon },
  { label: "Navy", value: "navy" as const, icon: Monitor },
  { label: "Colorblind", value: "colorblind" as const, icon: Shield },
] as const

const ACTION_ITEMS = [] as const

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()
  const { setTheme } = useTheme()

  // Global Cmd-K / Ctrl-K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const handleNav = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [close, router],
  )

  const handleTheme = useCallback(
    (value: "light" | "dark" | "navy" | "colorblind") => {
      setTheme(value)
      close()
    },
    [setTheme, close],
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search for a command to run..."
      className="sm:max-w-lg backdrop-blur-sm"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => handleNav(item.href)}
            >
              <item.icon className="size-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Categories">
          {CATEGORY_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => handleNav(item.href)}
            >
              <item.icon className="size-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          {THEME_ITEMS.map((item) => (
            <CommandItem
              key={item.value}
              onSelect={() => handleTheme(item.value)}
            >
              <item.icon className="size-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
