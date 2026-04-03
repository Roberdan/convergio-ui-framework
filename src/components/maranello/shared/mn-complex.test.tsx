import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MnDataTable } from "../data-display/mn-data-table";
import { MnGauge } from "../data-viz/mn-gauge";
import { MnActivityFeed } from "../feedback/mn-activity-feed";
import { MnDecisionMatrix } from "../strategy/mn-decision-matrix";
import { MnOrgChart } from "../network/mn-org-chart";

describe("MnDataTable", () => {
  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "status", label: "Status" },
  ];
  const data = [
    { name: "Alpha", status: "active" },
    { name: "Beta", status: "inactive" },
  ];

  it("renders column headers", () => {
    render(<MnDataTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(<MnDataTable columns={columns} data={data} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows empty message when no data", () => {
    render(<MnDataTable columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<MnDataTable columns={columns} data={[]} loading />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it("has aria grid role", () => {
    render(<MnDataTable columns={columns} data={data} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });
});

describe("MnGauge", () => {
  it("renders with meter role", () => {
    render(<MnGauge value={50} min={0} max={100} label="CPU" />);
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "50");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders with default label when none provided", () => {
    render(<MnGauge value={75} unit="%" />);
    expect(screen.getByLabelText("Gauge: 75%")).toBeInTheDocument();
  });

  it("contains a canvas element", () => {
    const { container } = render(<MnGauge value={30} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});

describe("MnActivityFeed", () => {
  const items = [
    { agent: "planner-01", action: "created", target: "Plan 42", timestamp: new Date().toISOString(), priority: "high" as const },
    { agent: "executor-02", action: "completed", target: "Task 7", timestamp: new Date().toISOString() },
  ];

  it("renders items", () => {
    render(<MnActivityFeed items={items} />);
    expect(screen.getByText("planner-01")).toBeInTheDocument();
    expect(screen.getByText("executor-02")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    render(<MnActivityFeed items={[]} />);
    expect(screen.getByText("No activity to display.")).toBeInTheDocument();
  });

  it("shows refresh button when onRefresh provided", () => {
    const onRefresh = vi.fn();
    render(<MnActivityFeed items={items} onRefresh={onRefresh} />);
    const btn = screen.getByLabelText("Refresh feed");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRefresh).toHaveBeenCalled();
  });

  it("has aria-live region", () => {
    const { container } = render(<MnActivityFeed items={items} />);
    const region = container.querySelector("[aria-live]");
    expect(region).toBeInTheDocument();
  });
});

describe("MnDecisionMatrix", () => {
  const criteria = [
    { name: "Cost", weight: 3 },
    { name: "Quality", weight: 5 },
  ];
  const options = [
    { name: "Vendor A", scores: [8, 7] },
    { name: "Vendor B", scores: [6, 9] },
  ];

  it("renders criteria headers", () => {
    render(<MnDecisionMatrix criteria={criteria} options={options} />);
    expect(screen.getByText("Cost")).toBeInTheDocument();
    expect(screen.getByText("Quality")).toBeInTheDocument();
  });

  it("renders option names", () => {
    render(<MnDecisionMatrix criteria={criteria} options={options} />);
    expect(screen.getByText("Vendor A")).toBeInTheDocument();
    expect(screen.getByText("Vendor B")).toBeInTheDocument();
  });

  it("highlights winner with BEST label", () => {
    render(<MnDecisionMatrix criteria={criteria} options={options} />);
    expect(screen.getByLabelText("Winner")).toBeInTheDocument();
  });

  it("returns null for empty data", () => {
    const { container } = render(<MnDecisionMatrix criteria={[]} options={[]} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("MnOrgChart", () => {
  const tree = {
    name: "Maria Rossi",
    role: "CEO",
    status: "active" as const,
    children: [
      { name: "Luca Bianchi", role: "CTO", status: "active" as const },
      { name: "Anna Verdi", role: "COO", status: "busy" as const },
    ],
  };

  it("renders root node", () => {
    render(<MnOrgChart tree={tree} />);
    expect(screen.getByText("Maria Rossi")).toBeInTheDocument();
    expect(screen.getByText("CEO")).toBeInTheDocument();
  });

  it("has tree role", () => {
    render(<MnOrgChart tree={tree} />);
    expect(screen.getByRole("tree")).toBeInTheDocument();
  });

  it("expands children by default for root", () => {
    render(<MnOrgChart tree={tree} />);
    expect(screen.getByText("Luca Bianchi")).toBeInTheDocument();
    expect(screen.getByText("Anna Verdi")).toBeInTheDocument();
  });

  it("calls onNodeClick when node clicked", () => {
    const onClick = vi.fn();
    render(<MnOrgChart tree={tree} onNodeClick={onClick} />);
    fireEvent.click(screen.getByText("Luca Bianchi"));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ name: "Luca Bianchi" }));
  });
});
