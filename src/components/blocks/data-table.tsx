import type { DataTableBlock } from "@/types";
import { cn } from "@/lib/utils";
import { BlockWrapper } from "./block-wrapper";

export interface DataTableProps extends DataTableBlock {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Data Table block component.
 *
 * Renders tabular data with typed columns and rows.
 * Use for: agent lists, task queues, audit logs, user tables, inventory.
 *
 * Supports loading skeleton, empty state (no rows), and error fallback.
 * Themed: bg-card borders, works in all 4 themes.
 */
export function DataTable({ loading, error, onRetry, columns, rows }: DataTableProps) {
  return (
    <BlockWrapper
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={!loading && !error && rows.length === 0}
      emptyMessage="No records to display."
      skeletonVariant="table"
    >
      <div className="rounded-lg border bg-card text-card-foreground overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn("p-3 font-medium", col.align === "right" && "text-right", col.align === "center" && "text-center")}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "p-3",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.mono && "font-mono",
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlockWrapper>
  );
}
