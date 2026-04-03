import { createElement } from "react";
import { resolveIcon } from "./icon-map";

/** Pre-resolved icon element for use in render without creating components dynamically. */
export function IconSlot({ name, className }: { name: string; className?: string }) {
  const icon = resolveIcon(name);
  if (!icon) return <span className={className} />;
  return createElement(icon, { className });
}
