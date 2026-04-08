import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MnBadge } from "../data-display/mn-badge";
import { MnSpinner } from "../data-display/mn-spinner";
import { MnStepper } from "../navigation/mn-stepper";
import { MnToggleSwitch } from "../forms/mn-toggle-switch";
import { MnSwot } from "../strategy/mn-swot";
import { MnThemeToggle } from "../theme/mn-theme-toggle";
import { ThemeProvider } from "@/components/theme/theme-provider";

describe("MnBadge", () => {
  it("renders label text", () => {
    render(<MnBadge label="Active" tone="success" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders children as fallback", () => {
    render(<MnBadge tone="info">Online</MnBadge>);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("applies role=status by default", () => {
    render(<MnBadge label="Warning" tone="warning" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("supports custom role", () => {
    render(<MnBadge label="Error" tone="danger" role="alert" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("MnSpinner", () => {
  it("renders with role=status", () => {
    render(<MnSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(<MnSpinner label="Processing" />);
    expect(screen.getByLabelText("Processing")).toBeInTheDocument();
  });

  it("renders sr-only text", () => {
    render(<MnSpinner label="Saving" />);
    expect(screen.getByText("Saving")).toBeInTheDocument();
  });
});

describe("MnStepper", () => {
  const steps = [
    { label: "Setup" },
    { label: "Configure" },
    { label: "Deploy" },
  ];

  it("renders all step labels", () => {
    render(<MnStepper steps={steps} currentStep={1} />);
    expect(screen.getByText("Setup")).toBeInTheDocument();
    expect(screen.getByText("Configure")).toBeInTheDocument();
    expect(screen.getByText("Deploy")).toBeInTheDocument();
  });

  it("marks current step with aria-current", () => {
    render(<MnStepper steps={steps} currentStep={1} />);
    const currentBtn = screen.getByText("Configure").closest("button");
    expect(currentBtn).toHaveAttribute("aria-current", "step");
  });

  it("disables pending steps", () => {
    render(<MnStepper steps={steps} currentStep={0} />);
    const deployBtn = screen.getByText("Deploy").closest("button");
    expect(deployBtn).toBeDisabled();
  });

  it("calls onChange on click", () => {
    const onChange = vi.fn();
    render(<MnStepper steps={steps} currentStep={1} onChange={onChange} />);
    fireEvent.click(screen.getByText("Setup"));
    expect(onChange).toHaveBeenCalledWith(0);
  });
});

describe("MnToggleSwitch", () => {
  it("renders with role=switch", () => {
    render(<MnToggleSwitch checked={false} onCheckedChange={vi.fn()} label="Dark mode" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("toggles on click", () => {
    const handler = vi.fn();
    render(<MnToggleSwitch checked={false} onCheckedChange={handler} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(handler).toHaveBeenCalledWith(true);
  });

  it("respects disabled state", () => {
    const handler = vi.fn();
    render(<MnToggleSwitch checked={false} onCheckedChange={handler} disabled />);
    fireEvent.click(screen.getByRole("switch"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("renders label text", () => {
    render(<MnToggleSwitch checked={true} onCheckedChange={vi.fn()} label="Notifications" />);
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });
});

describe("MnSwot", () => {
  const props = {
    strengths: ["Strong brand", "Loyal customers"],
    weaknesses: ["High costs"],
    opportunities: ["Market expansion"],
    threats: ["Competition"],
  };

  it("renders all four quadrants", () => {
    render(<MnSwot {...props} />);
    expect(screen.getByText("Strengths")).toBeInTheDocument();
    expect(screen.getByText("Weaknesses")).toBeInTheDocument();
    expect(screen.getByText("Opportunities")).toBeInTheDocument();
    expect(screen.getByText("Threats")).toBeInTheDocument();
  });

  it("renders items in each quadrant", () => {
    render(<MnSwot {...props} />);
    expect(screen.getByText("Strong brand")).toBeInTheDocument();
    expect(screen.getByText("High costs")).toBeInTheDocument();
    expect(screen.getByText("Market expansion")).toBeInTheDocument();
    expect(screen.getByText("Competition")).toBeInTheDocument();
  });

  it("shows empty state for empty quadrant", () => {
    render(<MnSwot strengths={[]} weaknesses={[]} opportunities={[]} threats={[]} />);
    const noItems = screen.getAllByText("No items");
    expect(noItems).toHaveLength(4);
  });

  it("has accessible region role", () => {
    render(<MnSwot {...props} />);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });
});

describe("MnThemeToggle", () => {
  it("cycles the active theme on click", () => {
    render(
      <ThemeProvider defaultTheme="navy">
        <MnThemeToggle />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Current theme:/i }));

    expect(document.documentElement).toHaveAttribute("data-theme", "colorblind");
  });
});
