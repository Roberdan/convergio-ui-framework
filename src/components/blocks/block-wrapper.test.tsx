import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlockWrapper } from "./block-wrapper";

/**
 * Tests for BlockWrapper: loading, error, empty, and content states.
 *
 * Verifies the priority order: loading > error > empty > children.
 * Uses realistic dashboard content for assertions.
 */

describe("BlockWrapper", () => {
  it("renders children when no state flags are set", () => {
    render(
      <BlockWrapper>
        <p>Revenue this quarter: $2.4M</p>
      </BlockWrapper>,
    );

    expect(
      screen.getByText("Revenue this quarter: $2.4M"),
    ).toBeInTheDocument();
  });

  it("renders loading skeleton instead of children", () => {
    const { container } = render(
      <BlockWrapper loading>
        <p>Should not appear</p>
      </BlockWrapper>,
    );

    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
    // Skeleton renders div elements with skeleton class
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
  });

  it("renders error state with message", () => {
    render(
      <BlockWrapper error="Failed to fetch agent metrics">
        <p>Should not appear</p>
      </BlockWrapper>,
    );

    expect(
      screen.getByText("Failed to fetch agent metrics"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(
      <BlockWrapper error="Connection timeout" onRetry={onRetry}>
        <p>Hidden</p>
      </BlockWrapper>,
    );

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    retryButton.click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not render retry button when onRetry is absent", () => {
    render(
      <BlockWrapper error="Server error">
        <p>Hidden</p>
      </BlockWrapper>,
    );

    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("renders empty state with default message", () => {
    render(
      <BlockWrapper empty>
        <p>Should not appear</p>
      </BlockWrapper>,
    );

    expect(screen.getByText("No data available.")).toBeInTheDocument();
    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
  });

  it("renders empty state with custom message", () => {
    render(
      <BlockWrapper empty emptyMessage="No deployments recorded yet.">
        <p>Hidden</p>
      </BlockWrapper>,
    );

    expect(
      screen.getByText("No deployments recorded yet."),
    ).toBeInTheDocument();
  });

  it("prioritizes loading over error", () => {
    render(
      <BlockWrapper loading error="This should not show">
        <p>Hidden</p>
      </BlockWrapper>,
    );

    expect(
      screen.queryByText("This should not show"),
    ).not.toBeInTheDocument();
  });

  it("prioritizes error over empty", () => {
    render(
      <BlockWrapper error="Database unreachable" empty>
        <p>Hidden</p>
      </BlockWrapper>,
    );

    expect(screen.getByText("Database unreachable")).toBeInTheDocument();
  });

  it("renders table skeleton variant", () => {
    const { container } = render(
      <BlockWrapper loading skeletonVariant="table">
        <p>Hidden</p>
      </BlockWrapper>,
    );

    // Table variant has multiple skeleton rows
    const skeletons = container.querySelectorAll(".rounded-lg");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders feed skeleton variant", () => {
    const { container } = render(
      <BlockWrapper loading skeletonVariant="feed">
        <p>Hidden</p>
      </BlockWrapper>,
    );

    expect(container.querySelector(".rounded-md")).toBeInTheDocument();
  });
});
