# Adding a 5th Theme

How to add a new theme (e.g. `mytheme`) to the frontend.

## Step 1: Register the theme name in ThemeProvider

File: `src/components/theme/theme-provider.tsx`

Add the theme name to the `THEMES` tuple:

```ts
const THEMES = ["light", "dark", "navy", "colorblind", "mytheme"] as const;
```

Update `applyTheme()` to classify it as dark or light for Tailwind:

```ts
function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  // Add mytheme here if it should use dark-mode utilities
  if (theme === "dark" || theme === "navy" || theme === "colorblind" || theme === "mytheme") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}
```

## Step 2: Add CSS custom properties in globals.css

File: `src/app/globals.css`

Add a new `[data-theme="mytheme"]` block with all required tokens.

### Required Maranello semantic tokens

| Token | Purpose |
|---|---|
| `--mn-accent` | Primary brand color |
| `--mn-accent-hover` | Hover state of accent |
| `--mn-accent-text` | Text on accent backgrounds |
| `--mn-accent-bg` | Subtle accent background |
| `--mn-accent-border` | Accent-tinted border |
| `--mn-surface` | Default surface |
| `--mn-surface-raised` | Elevated surface (cards) |
| `--mn-surface-sunken` | Recessed surface |
| `--mn-surface-input` | Input field background |
| `--mn-surface-overlay` | Overlay/popover background |
| `--mn-surface-hover` | Surface hover state |
| `--mn-text` | Primary text |
| `--mn-text-muted` | Secondary text |
| `--mn-text-tertiary` | Tertiary text |
| `--mn-text-disabled` | Disabled text |
| `--mn-text-inverse` | Text on dark/light inverse |
| `--mn-border` | Default border |
| `--mn-border-subtle` | Subtle separator |
| `--mn-border-strong` | Strong/emphasized border |
| `--mn-border-focus` | Focus ring border |
| `--mn-border-error` | Error state border |
| `--mn-hover-bg` | Generic hover background |
| `--mn-active-bg` | Active/pressed background |
| `--mn-focus-ring` | Focus ring color |
| `--mn-focus-ring-offset` | Focus ring offset |
| `--mn-error` | Error color |
| `--mn-error-bg` | Error background |
| `--mn-success` | Success color |
| `--mn-success-bg` | Success background |
| `--mn-warning` | Warning color |
| `--mn-warning-bg` | Warning background |
| `--mn-info` | Info color |
| `--mn-info-bg` | Info background |
| `--mn-backdrop` | Modal backdrop |
| `--mn-scrim` | Scrim overlay |
| `--mn-danger-text` | Danger button text |

### Required shadcn bridge tokens

| Token | Purpose |
|---|---|
| `--background` | Page background |
| `--foreground` | Page text |
| `--card` / `--card-foreground` | Card surface |
| `--popover` / `--popover-foreground` | Popover surface |
| `--primary` / `--primary-foreground` | Primary actions |
| `--secondary` / `--secondary-foreground` | Secondary actions |
| `--muted` / `--muted-foreground` | Muted surfaces |
| `--accent` / `--accent-foreground` | Accent surfaces |
| `--destructive` | Destructive actions |
| `--border` | Default border |
| `--input` | Input background |
| `--ring` | Focus ring |
| `--sidebar` / `--sidebar-foreground` | Sidebar background |
| `--sidebar-primary` / `--sidebar-primary-foreground` | Sidebar active |
| `--sidebar-accent` / `--sidebar-accent-foreground` | Sidebar hover |
| `--sidebar-border` / `--sidebar-ring` | Sidebar borders |
| `--chart-1` through `--chart-5` | Chart palette |
| `--status-success/warning/error/info` | Status indicators |

### Example block

```css
[data-theme="mytheme"] {
  --mn-accent:          #6C5CE7;
  --mn-accent-hover:    #5A4BD1;
  --mn-accent-text:     #ffffff;
  --mn-accent-bg:       color-mix(in srgb, #6C5CE7 8%, transparent);
  --mn-accent-border:   color-mix(in srgb, #6C5CE7 20%, transparent);
  --mn-surface:         #1a1a2e;
  --mn-surface-raised:  #222240;
  /* ... fill in all tokens above ... */

  /* shadcn bridge */
  --background: #1a1a2e;
  --foreground: var(--mn-text);
  /* ... fill in all bridge tokens ... */
}
```

## Step 3: Update theme-script.tsx (flash prevention)

File: `src/components/theme/theme-script.tsx`

Add `"mytheme"` to the allowed-values array in the inline script:

```ts
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("convergio-theme");
if(t&&["light","dark","navy","colorblind","mytheme"].indexOf(t)!==-1){
  document.documentElement.setAttribute("data-theme",t);
  document.documentElement.className=document.documentElement.className.replace(/ ?dark/g,"");
  if(t!=="light")document.documentElement.classList.add("dark")
}}catch(e){}})()`;
```

## Step 4: Add to theme toggle and rotary components

### theme-toggle.tsx

File: `src/components/maranello/mn-theme-toggle.tsx`

Add an entry to `THEME_META`:

```ts
const THEME_META: Record<Theme, { icon: string; label: string }> = {
  light:      { icon: "\u25D1", label: "Light" },
  dark:       { icon: "\u25CF", label: "Dark" },
  navy:       { icon: "\u2693", label: "Navy" },
  colorblind: { icon: "\u25D0", label: "Colorblind" },
  mytheme:    { icon: "\u2726", label: "My Theme" },
};
```

### theme-rotary.tsx

File: `src/components/maranello/mn-theme-rotary.tsx`

Add a position entry to `POSITIONS`. Distribute angles evenly across 360 degrees
for 5 items (72 degrees apart):

```ts
const POSITIONS: ThemePosition[] = [
  { mode: "light",      label: "Light",      abbr: "LT", angle: -54 },
  { mode: "dark",       label: "Dark",       abbr: "DK", angle: 18 },
  { mode: "navy",       label: "Navy",       abbr: "NV", angle: 90 },
  { mode: "colorblind", label: "Colorblind", abbr: "CB", angle: 162 },
  { mode: "mytheme",    label: "My Theme",   abbr: "MT", angle: 234 },
];
```

## Step 5: Update convergio.yaml (optional)

If you want the new theme as default, update `theme.default`:

```yaml
theme:
  default: mytheme
  storageKey: convergio-theme
```

## Checklist

- [ ] Theme name added to `THEMES` tuple in theme-provider.tsx
- [ ] `applyTheme()` classifies new theme correctly (dark/light)
- [ ] CSS custom properties block added in globals.css
- [ ] All Maranello semantic tokens defined
- [ ] All shadcn bridge tokens defined
- [ ] WCAG 2.2 AA contrast ratios verified (4.5:1 text, 3:1 UI)
- [ ] theme-script.tsx allowlist updated
- [ ] THEME_META entry added in mn-theme-toggle.tsx
- [ ] POSITIONS entry added in mn-theme-rotary.tsx
- [ ] Manual test: toggle through all themes, verify no flash on reload
