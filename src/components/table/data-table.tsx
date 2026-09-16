import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Pagination } from "./pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  getRowId?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  isError,
  onRetry,
  emptyTitle = "Belum ada data",
  emptyDescription = "Data akan muncul di sini setelah ditambahkan.",
  pageSize = 10,
  getRowId,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    initialState: { pagination: { pageSize } },
  });

  if (isError) {
    return (
      <Card>
        <ErrorState onRetry={onRetry} description="Tidak dapat mengambil data. Coba lagi." />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gradient-to-r from-primary-light/60 to-primary-light/30">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary",
                      (header.column.columnDef.meta as { align?: "center" | "right" } | undefined)?.align === "center" &&
                        "text-center",
                      (header.column.columnDef.meta as { align?: "center" | "right" } | undefined)?.align === "right" &&
                        "text-right"
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-border transition-colors hover:bg-primary-light/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3.5 align-middle text-text-primary",
                        (cell.column.columnDef.meta as { align?: "center" | "right" } | undefined)?.align === "center" &&
                          "text-center",
                        (cell.column.columnDef.meta as { align?: "center" | "right" } | undefined)?.align === "right" &&
                          "text-right"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && (
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          pageCount={table.getPageCount()}
          pageSize={pageSize}
          totalItems={data.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      )}
    </Card>
  );
}
