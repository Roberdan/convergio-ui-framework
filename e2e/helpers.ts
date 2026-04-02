import { Page } from "@playwright/test";

/** Infrastructure error filter for console noise. */
export function isInfraError(msg: string): boolean {
  return (
    msg.includes("webpack-hmr") ||
    msg.includes("_next/webpack") ||
    msg.includes("favicon") ||
    msg.includes("hydration") ||
    msg.includes("ERR_CONNECTION_REFUSED")
  );
}

export interface PageIssue {
  type: "pageerror" | "console.error" | "error-boundary" | "blank-page";
  message: string;
}

export async function collectPageIssues(page: Page): Promise<PageIssue[]> {
  const issues: PageIssue[] = [];

  page.on("pageerror", (err) => {
    issues.push({ type: "pageerror", message: err.message });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error" && !isInfraError(msg.text())) {
      issues.push({ type: "console.error", message: msg.text() });
    }
  });

  return issues;
}

export async function checkErrorBoundary(page: Page): Promise<PageIssue[]> {
  const issues: PageIssue[] = [];
  const body = await page.locator("body").textContent();

  if (body?.includes("Something went wrong")) {
    issues.push({
      type: "error-boundary",
      message: "Error boundary triggered: 'Something went wrong'",
    });
  }

  if (body?.includes("undefined is not an object")) {
    issues.push({
      type: "error-boundary",
      message: "Runtime error visible: 'undefined is not an object'",
    });
  }

  if (!body || body.trim().length < 20) {
    issues.push({
      type: "blank-page",
      message: `Page appears blank (body length: ${body?.trim().length ?? 0})`,
    });
  }

  return issues;
}
