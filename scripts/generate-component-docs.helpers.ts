// generate-component-docs helpers — prop extraction & a11y notes
import * as fs from "node:fs";

export interface CatalogEntry {
  name: string;
  slug: string;
  category: string;
  description: string;
  keywords: string[];
  whenToUse: string;
  filePath: string;
  propsInterface: string;
}

export interface PropInfo {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  defaultValue: string;
}

export function extractProps(sourceFile: string, propsInterface: string): PropInfo[] {
  if (!fs.existsSync(sourceFile)) return [];
  const src = fs.readFileSync(sourceFile, "utf-8");

  // Find props interface/type
  const ifaceRe = new RegExp(
    `(?:export\\s+)?(?:interface|type)\\s+${escapeRe(propsInterface)}[^{]*\\{`,
    "s"
  );
  const ifaceStart = ifaceRe.exec(src);
  if (!ifaceStart) return [];

  // Extract balanced braces
  const startIdx = ifaceStart.index + ifaceStart[0].length;
  let depth = 1;
  let endIdx = startIdx;
  for (let i = startIdx; i < src.length && depth > 0; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}") depth--;
    endIdx = i;
  }
  const body = src.slice(startIdx, endIdx);
  const props: PropInfo[] = [];

  // Parse props with JSDoc support
  // First, normalize: split lines with multiple props (separated by ;)
  const rawLines = body.split("\n");
  const lines: string[] = [];
  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    // Split on ; but only if followed by a prop declaration (word + optional ? + :)
    const parts = trimmed.split(/;\s*(?=\w+\??\s*:)/);
    for (const part of parts) {
      const p = part.trim();
      if (p) lines.push(p);
    }
  }
  let pendingDoc = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { pendingDoc = ""; continue; }

    // Collect JSDoc: /** ... */
    const jsdocInline = /\/\*\*\s*(.+?)\s*\*\//.exec(trimmed);
    if (jsdocInline && !trimmed.match(/^\w/)) {
      pendingDoc = jsdocInline[1];
      continue;
    }

    // Skip pure comment lines
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      const cmt = trimmed.replace(/^\/\*\*?\s*|\*\/\s*$|\*\s*/g, "").trim();
      if (cmt) pendingDoc = cmt;
      continue;
    }

    // Match prop line
    const propRe = /^(\w+)(\?)?:\s*(.+?)(?:;?\s*(?:\/\/\s*(.+))?$)/;
    const pm = propRe.exec(trimmed);
    if (!pm) { pendingDoc = ""; continue; }

    const [, propName, optMark, rawType, inlineComment] = pm;
    const optional = !!optMark;
    const type = rawType.replace(/\/\/.*$/, "").replace(/;$/, "").trim();

    // Description priority: JSDoc > inline comment > auto-generate
    let description = pendingDoc || inlineComment?.trim() || "";
    if (!description) {
      description = inferPropDescription(propName, type, optional);
    }

    // Try to find default value from destructuring
    const defaultValue = findDefault(src, propName, optional);

    props.push({ name: propName, type, optional, description, defaultValue });
    pendingDoc = "";
  }

  return props;
}

export function findDefault(src: string, propName: string, optional: boolean): string {
  if (!optional) return "**required**";
  // Match: propName = value in destructuring
  const re = new RegExp(`${propName}\\s*=\\s*([^,}\\n]+)`);
  const m = re.exec(src);
  if (m) {
    let val = m[1].trim();
    if (val.endsWith(",")) val = val.slice(0, -1).trim();
    if (val.length > 40) return "\u2014"; // too complex
    return `\`${val}\``;
  }
  return "\u2014";
}

export function inferPropDescription(name: string, type: string, optional: boolean): string {
  const map: Record<string, string> = {
    className: "Additional CSS classes",
    children: "Child elements",
    ariaLabel: "Accessible label for screen readers",
    "aria-label": "Accessible label for screen readers",
    onClick: "Click event handler",
    onChange: "Change event handler",
    onOpenChange: "Callback when open state changes",
    open: "Whether the component is open/visible",
    loading: "Show loading state",
    disabled: "Disable the component",
    animate: "Enable entry animation",
    showLegend: "Display the legend",
    editable: "Enable inline editing",
    title: "Title text",
    label: "Display label",
    value: "Current value",
    min: "Minimum value",
    max: "Maximum value",
    unit: "Unit suffix (e.g. \"%\", \"$\", \"km/h\")",
    size: "Size variant",
    variant: "Visual variant",
    tone: "Color tone variant",
    compact: "Use compact/dense layout",
    placeholder: "Placeholder text",
    searchable: "Enable search/filter",
    selectable: "Enable row selection",
    sortable: "Enable column sorting",
    refreshInterval: "Auto-refresh interval in milliseconds (0 = disabled)",
    maxVisible: "Maximum number of visible items",
    currency: "Currency symbol or code",
    height: "Component height in pixels",
    showValues: "Display numeric values on items",
    showGrid: "Display grid lines",
    stacked: "Use stacked layout",
    orientation: "Layout orientation",
    defaultOpen: "Whether initially open/expanded",
    collapsible: "Enable collapse/expand behavior",
  };
  if (map[name]) return map[name];

  // Pattern-based inference
  if (name.startsWith("on") && name.length > 2) return `Callback when ${name.slice(2).replace(/([A-Z])/g, " $1").toLowerCase().trim()}`;
  if (name.startsWith("show")) return `Whether to show ${name.slice(4).replace(/([A-Z])/g, " $1").toLowerCase().trim()}`;
  if (name.startsWith("enable")) return `Enable ${name.slice(6).replace(/([A-Z])/g, " $1").toLowerCase().trim()}`;
  if (name.startsWith("default")) return `Default value for ${name.slice(7).replace(/([A-Z])/g, " $1").toLowerCase().trim()}`;

  // Type-based
  if (type.includes("[]") || type.includes("Array")) return `Array of ${name}`;
  if (type === "boolean") return optional ? `Enable ${name.replace(/([A-Z])/g, " $1").toLowerCase().trim()}` : `Whether ${name.replace(/([A-Z])/g, " $1").toLowerCase().trim()} is active`;
  if (type === "string") return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")} text`;
  if (type === "number") return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")} value`;

  return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")}`;
}

export function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── accessibility notes ────────────────────────────────────────────
export function a11yNotes(entry: CatalogEntry): string {
  const notes: string[] = [];
  const cat = entry.category;
  const slug = entry.slug;

  if (cat === "forms") {
    notes.push("- Form controls are associated with labels via `htmlFor`/`id`");
    notes.push("- Validation errors are announced to screen readers");
    notes.push("- Supports keyboard navigation between fields");
  } else if (cat === "navigation") {
    notes.push("- Implements `aria-current` for active navigation items");
    notes.push("- Full keyboard navigation support with arrow keys");
  } else if (cat === "feedback") {
    notes.push("- Uses `role=\"alert\"` or `aria-live` regions for dynamic content");
    notes.push("- Focus is managed when content appears/disappears");
  } else if (cat === "data-display") {
    notes.push("- Color is not the only indicator \u2014 text or icons provide meaning");
    notes.push("- Interactive elements are keyboard accessible");
  } else if (cat === "data-viz") {
    notes.push("- Charts include `aria-label` describing the data trend");
    notes.push("- Color is supplemented with labels for color-blind users");
  } else if (cat === "layout") {
    notes.push("- Uses semantic landmarks (`<main>`, `<nav>`, `<aside>`)");
    notes.push("- Skip-to-content link is supported");
  } else if (cat === "network") {
    notes.push("- Interactive nodes are keyboard focusable");
    notes.push("- Status information uses `aria-live` for updates");
  } else if (cat === "ops") {
    notes.push("- Data tables include proper `<th>` scope attributes");
    notes.push("- Drag-and-drop has keyboard alternatives");
  } else if (cat === "strategy") {
    notes.push("- Matrix cells are keyboard navigable");
    notes.push("- Visual data is supplemented with text descriptions");
  } else if (cat === "theme") {
    notes.push("- Theme changes are announced via `aria-live`");
    notes.push("- All controls meet WCAG 2.2 AA contrast requirements");
  } else if (cat === "financial") {
    notes.push("- Monetary values use `aria-label` for screen reader clarity");
    notes.push("- Tables include proper header associations");
  } else if (cat === "agentic") {
    notes.push("- Status updates use `aria-live` for real-time announcements");
    notes.push("- Interactive elements support keyboard activation");
  }

  if (slug.includes("modal") || slug.includes("dialog")) {
    notes.push("- Focus is trapped inside the modal while open");
    notes.push("- Escape key closes the modal");
  }
  if (slug.includes("tab")) {
    notes.push("- Follows WAI-ARIA Tabs pattern (`role=\"tablist\"` / `role=\"tab\"`)");
  }
  if (slug.includes("toggle") || slug.includes("switch")) {
    notes.push("- Uses `role=\"switch\"` with `aria-checked` state");
  }

  return notes.join("\n");
}
