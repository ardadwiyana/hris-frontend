import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical, Pencil, Plus, Trash2, UserCheck, UserX, Umbrella, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/form/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/table/data-table";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDeleteEmployee, useEmployees } from "../hooks/use-employees";
import { useDepartments } from "@/features/department/hooks/use-departments";
import { EmployeeFormDialog } from "../components/employee-form-dialog";
import { GeneratedPasswordDialog } from "../components/generated-password-dialog";
import { EMPLOYMENT_STATUS_OPTIONS, type CreateEmployeeResult, type Employee } from "../types";

export default function EmployeesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const canCreate = user?.role === "admin";
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const canDelete = user?.role === "admin";
  const showActionsColumn = user?.role !== "employee";

  const { data, isLoading, isError, refetch } = useEmployees();
  const { data: departments } = useDepartments();
  const deleteMutation = useDeleteEmployee();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [generatedResult, setGeneratedResult] = useState<CreateEmployeeResult | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    setSearchParams(value ? { q: value } : {});
  }

  const summary = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      active: all.filter((e) => e.status === "Active").length,
      inactive: all.filter((e) => e.status === "Inactive").length,
      onLeave: all.filter((e) => e.status === "On Leave").length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data
      .filter((e) => {
        if (departmentFilter && String(e.department_id) !== departmentFilter) return false;
        if (statusFilter && e.status !== statusFilter) return false;
        if (
          q &&
          !e.nama_lengkap.toLowerCase().includes(q) &&
          !e.email.toLowerCase().includes(q) &&
          !e.nik.toLowerCase().includes(q)
        )
          return false;
        return true;
      })
      .sort((a, b) => b.id - a.id) // newest first
      .map((e, index) => ({ ...e, rowNumber: index + 1 }));
  }, [data, search, departmentFilter, statusFilter]);

  const columns: ColumnDef<(typeof filtered)[number]>[] = useMemo(() => {
    const base: ColumnDef<(typeof filtered)[number]>[] = [
      {
        header: "No",
        accessorKey: "rowNumber",
        enableSorting: false,
        meta: { align: "center" },
        cell: (c) => <span className="text-text-secondary">{c.getValue<number>()}</span>,
      },
      {
        header: "Nama",
        id: "nama",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.nama_lengkap} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{row.original.nama_lengkap}</p>
              <p className="truncate text-xs text-text-secondary">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      { header: "NIK", accessorKey: "nik", enableSorting: false },
      {
        header: "Departemen",
        id: "dept",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.departments?.nama_departemen ? (
            <Badge tone="info">{row.original.departments.nama_departemen}</Badge>
          ) : (
            <span className="text-text-secondary">—</span>
          ),
      },
      {
        header: "Posisi",
        id: "position",
        enableSorting: false,
        accessorFn: (r) => r.positions?.nama_posisi ?? "—",
      },
      {
        header: "Status",
        accessorKey: "status",
        enableSorting: false,
        cell: (c) => <StatusBadge status={c.getValue<string>()} />,
      },
    ];

    if (showActionsColumn) {
      base.push({
        header: "Aksi",
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip content="Lihat Detail">
                <button
                  onClick={() => navigate(`/employees/${row.original.id}`)}
                  className="rounded-md p-1.5 text-text-secondary hover:bg-primary-light hover:text-primary-dark"
                  aria-label={`Lihat detail ${row.original.nama_lengkap}`}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </Tooltip>
              {canEdit && (
                <Tooltip content="Edit">
                  <button
                    onClick={() => {
                      setEditing(row.original);
                      setFormOpen(true);
                    }}
                    className="rounded-md p-1.5 text-text-secondary hover:bg-primary-light hover:text-primary-dark"
                    aria-label={`Edit ${row.original.nama_lengkap}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </Tooltip>
              )}
              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded-md p-1.5 text-text-secondary hover:bg-primary-light hover:text-primary-dark"
                      aria-label={`Menu aksi untuk ${row.original.nama_lengkap}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem danger onSelect={() => setDeleting(row.original)}>
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </TooltipProvider>
        ),
      });
    }

    return base;
  }, [canEdit, canDelete, showActionsColumn, navigate]);

  async function confirmDelete() {
    if (!deleting) return;
    await deleteMutation.mutateAsync(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        description="Kelola data seluruh karyawan di organisasi Anda."
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Tambah Karyawan
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-6 w-1/2" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Total Employees" value={summary.total} icon={<Users className="h-5 w-5" />} accent="primary" description="Karyawan terdaftar" />
            <StatCard label="Active Employees" value={summary.active} icon={<UserCheck className="h-5 w-5" />} accent="success" description="Status Aktif" />
            <StatCard label="Inactive Employees" value={summary.inactive} icon={<UserX className="h-5 w-5" />} accent="danger" description="Status tidak aktif" />
            <StatCard label="Employees on Leave" value={summary.onLeave} icon={<Umbrella className="h-5 w-5" />} accent="info" description="Status Cuti" />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Cari nama, email, atau NIK..."
          className="w-full max-w-xs"
        />
        <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-auto max-w-[200px]" aria-label="Filter departemen">
          <option value="">Semua Departemen</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama_departemen}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto max-w-[160px]" aria-label="Filter status">
          <option value="">Semua Status</option>
          {EMPLOYMENT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        getRowId={(r) => String(r.id)}
        emptyTitle="Belum ada karyawan"
        emptyDescription="Tambahkan karyawan pertama untuk mulai mengelola data HR."
      />

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editing}
        onCreated={(result) => setGeneratedResult(result)}
      />

      {generatedResult && (
        <GeneratedPasswordDialog
          open={Boolean(generatedResult)}
          onOpenChange={(open) => !open && setGeneratedResult(null)}
          employeeName={generatedResult.employee.nama_lengkap}
          email={generatedResult.employee.email}
          password={generatedResult.generatedPassword}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus Karyawan"
        description={`Data karyawan "${deleting?.nama_lengkap}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
