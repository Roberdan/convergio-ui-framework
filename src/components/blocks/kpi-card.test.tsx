import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "./kpi-card";

/**
 * Tests for KpiCard block component.
 *
 * Validates rendering of label, value, change indicator,
 * and trend icon with appropriate accessibility labels.
 */

describe("KpiCard", () => {
  it("renders label and value", () => {
    render(
      <KpiCard
        type="kpi-card"
        label="Active Agents"
        value="12"
      />,
    );

    expect(screen.getByText("Active Agents")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders change indicator with upward trend", () => {
    render(
      <KpiCard
        type="kpi-card"
        label="Monthly Revenue"
        value="$84,200"
        change="+12.5%"
        trend="up"
      />,
    );

    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
    expect(screen.getByText("$84,200")).toBeInTheDocument();
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
    expect(screen.getByText("Trending up:")).toBeInTheDocument();
  });

  it("renders downward trend with correct label", () => {
    render(
      <KpiCard
        type="kpi-card"
        label="Error Rate"
        value="3.2%"
        change="-0.8%"
        trend="down"
      />,
    );

    expect(screen.getByText("Error Rate")).toBeInTheDocument();
    expect(screen.getByText("-0.8%")).toBeInTheDocument();
    expect(screen.getByText("Trending down:")).toBeInTheDocument();
  });

  it("renders flat trend with no-change label", () => {
    render(
      <KpiCard
        type="kpi-card"
        label="System Uptime"
        value="99.97%"
        change="0%"
        trend="flat"
      />,
    );

    expect(screen.getByText("System Uptime")).toBeInTheDocument();
    expect(screen.getByText("99.97%")).toBeInTheDocument();
    expect(screen.getByText("No change:")).toBeInTheDocument();
  });

  it("renders without change indicator when omitted", () => {
    render(
      <KpiCard
        type="kpi-card"
        label="Total Deployments"
        value="1,847"
      />,
    );

    expect(screen.getByText("Total Deployments")).toBeInTheDocument();
    expect(screen.getByText("1,847")).toBeInTheDocument();
    // No sr-only trend label should be present
    expect(screen.queryByText(/Trending/)).not.toBeInTheDocument();
    expect(screen.queryByText("No change:")).not.toBeInTheDocument();
  });

  it("delegates to BlockWrapper loading state", () => {
    render(
      <KpiCard
        type="kpi-card"
        label="Hidden During Load"
        value="0"
        loading
      />,
    );

    expect(
      screen.queryByText("Hidden During Load"),
    ).not.toBeInTheDocument();
  });

  it("delegates to BlockWrapper error state", () => {
    render(
      <KpiCard
        type="kpi-card"
        label="Hidden During Error"
        value="0"
        error="Metrics service unavailable"
      />,
    );

    expect(
      screen.getByText("Metrics service unavailable"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Hidden During Error"),
    ).not.toBeInTheDocument();
  });
});
