/**
 * Smoke tests for the highest-blast-radius untested Maranello components.
 *
 * Target selection (per audit usage grep across src/):
 *  - MnSectionCard     (126 call sites)
 *  - MnStateScaffold   ( 51 call sites)
 *  - MnFormField       ( 40 call sites)
 *  - MnProgressRing    ( 17 call sites)
 *  - MnIcon            (shared primitive)
 *  - MnBreadcrumb      (shell navigation)
 *
 * Narrow-scope: render + one accessible attribute + one interaction per
 * component. Lifts statement coverage on high-traffic paths without
 * constraining future refactors.
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { MnSectionCard } from "../layout/mn-section-card";
import { MnStateScaffold } from "../feedback/mn-state-scaffold";
import { MnFormField } from "../forms/mn-form-field";
import { MnProgressRing } from "../data-display/mn-progress-ring";
import { MnIcon } from "../data-display/mn-icon";
import { MnBreadcrumb } from "../navigation/mn-breadcrumb";

describe("MnSectionCard", () => {
  it("renders title, children, and a collapsible button header", () => {
    render(
      <MnSectionCard title="Dashboard">
        <p>Body content</p>
      </MnSectionCard>,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    const header = screen.getByRole("button", { name: /dashboard/i });
    expect(header).toHaveAttribute("aria-expanded", "true");
  });

  it("flips aria-expanded when the collapsible header is clicked", () => {
    render(
      <MnSectionCard title="Collapsible">
        <p>Inner</p>
      </MnSectionCard>,
    );
    const header = screen.getByRole("button", { name: /collapsible/i });
    expect(header).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
  });

  it("renders an action link when href is provided", () => {
    render(
      <MnSectionCard
        title="With action"
        action={{ label: "View all", href: "/all" }}
      >
        <span />
      </MnSectionCard>,
    );
    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
      "href",
      "/all",
    );
  });

  it("drops the role=button affordance when collapsible is false", () => {
    render(
      <MnSectionCard title="Static" collapsible={false}>
        <p>content</p>
      </MnSectionCard>,
    );
    expect(
      screen.queryByRole("button", { name: /static/i }),
    ).not.toBeInTheDocument();
  });
});

describe("MnStateScaffold", () => {
  it("renders the loading panel as aria-busy", () => {
    const { container } = render(<MnStateScaffold state="loading" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveAttribute("data-state", "loading");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders children when state is ready", () => {
    render(
      <MnStateScaffold state="ready">
        <p>Payload</p>
      </MnStateScaffold>,
    );
    expect(screen.getByText("Payload")).toBeInTheDocument();
  });

  it("calls onRetry from the error state via the default Retry button", () => {
    const onRetry = vi.fn();
    render(
      <MnStateScaffold state="error" message="Boom" onRetry={onRetry} />,
    );
    expect(screen.getByText("Boom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("marks the error container with role=alert", () => {
    const { container } = render(
      <MnStateScaffold state="error" message="bad" />,
    );
    expect(container.firstElementChild).toHaveAttribute("role", "alert");
  });
});

describe("MnFormField", () => {
  it("wires the label via htmlFor and injects id on the first child", () => {
    render(
      <MnFormField fieldId="email" label="Email">
        <input type="email" />
      </MnFormField>,
    );
    const label = screen.getByText("Email");
    expect(label.tagName.toLowerCase()).toBe("label");
    expect(label).toHaveAttribute("for", "email");
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("surfaces hint and error copy and sets aria-invalid + aria-describedby", () => {
    render(
      <MnFormField
        fieldId="pwd"
        label="Password"
        hint="Min 8 chars"
        error="Too short"
      >
        <input type="password" />
      </MnFormField>,
    );
    expect(screen.getByText("Min 8 chars")).toBeInTheDocument();
    expect(screen.getByText("Too short")).toBeInTheDocument();
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain("pwd-error");
  });

  it("renders a required asterisk when required", () => {
    render(
      <MnFormField fieldId="x" label="Name" required>
        <input />
      </MnFormField>,
    );
    // Asterisk lives inside the label (aria-hidden) — label text still starts with "Name".
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("MnProgressRing", () => {
  it("exposes a progressbar role with the computed percentage", () => {
    render(<MnProgressRing value={73} label="Upload progress" />);
    const el = screen.getByRole("progressbar", { name: /upload progress/i });
    expect(el.getAttribute("aria-valuenow")).toBe("73");
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("100");
  });

  it("clamps out-of-range inputs to [0, 100]", () => {
    render(<MnProgressRing value={150} label="Over" />);
    expect(
      screen
        .getByRole("progressbar", { name: /over/i })
        .getAttribute("aria-valuenow"),
    ).toBe("100");

    render(<MnProgressRing value={-20} label="Under" />);
    expect(
      screen
        .getByRole("progressbar", { name: /under/i })
        .getAttribute("aria-valuenow"),
    ).toBe("0");
  });

  it("falls back to a descriptive aria-label when none is supplied", () => {
    render(<MnProgressRing value={42} />);
    expect(
      screen.getByRole("progressbar", { name: /42% complete/i }),
    ).toBeInTheDocument();
  });
});

describe("MnIcon", () => {
  it("renders a meaningful icon with role=img and the supplied label", () => {
    render(<MnIcon name="dashboard" label="Dashboard" />);
    const img = screen.getByRole("img", { name: /dashboard/i });
    expect(img.tagName.toLowerCase()).toBe("svg");
  });

  it("marks decorative icons (no label) as aria-hidden without role", () => {
    const { container } = render(<MnIcon name="home" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("role")).toBeNull();
  });

  it("returns null for an unknown icon name", () => {
    const { container } = render(
      // @ts-expect-error — deliberately invalid icon name
      <MnIcon name="does-not-exist" />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe("MnBreadcrumb", () => {
  it("renders links for non-current items and marks the last one aria-current=page", () => {
    render(
      <MnBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Agents", href: "/agents" },
          { label: "NaSra" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Agents" })).toHaveAttribute(
      "href",
      "/agents",
    );
    const current = screen.getByText("NaSra");
    expect(current.tagName.toLowerCase()).toBe("span");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("fires onNavigate with the item, index, and event on link click", () => {
    const onNavigate = vi.fn();
    render(
      <MnBreadcrumb
        onNavigate={onNavigate}
        items={[
          { label: "Home", href: "/" },
          { label: "Agents" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate.mock.calls[0][0]).toMatchObject({ label: "Home" });
    expect(onNavigate.mock.calls[0][1]).toBe(0);
  });

  it("returns null on an empty items array", () => {
    const { container } = render(<MnBreadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
