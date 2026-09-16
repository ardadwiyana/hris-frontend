import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, CheckCircle2, Clock, FileText, Plus, Trash2, X, XCircle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { SearchInput } from "@/components/form/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/table/data-table";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCurrentEmployee } from "@/features/employee/hooks/use-employees";
import { useDeleteLeave, useLeaves, useUpdateLeaveStatus } from "../hooks/use-leaves";
import { LeaveFormDialog } from "../components/leave-form-dialog";
import type { Leave } from "../types";

export default function LeavesPage() {
  const { user } = useAuth();
  const canApprove = user?.role === "admin" || user?.role === "manager";
  const { employee: myEmployee } = useCurrentEmployee();

  const { data, isLoading, isError, refetch } = useLeaves();
  const updateStatusMutation = useUpdateLeaveStatus();
  const deleteMutation = useDeleteLeave();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [approving, setApproving] = useState<Leave | null>(null);
  const [rejecting, setRejecting] = useState<Leave | null>(null);
  const [deleting, setDeleting] = useState<Leave | null>(null);

  const scoped = useMemo(() => {
    if (!data) return [];
    // Employees only see their own requests; admin/manager see everyone's.
    if (user?.role === "employee") {
      return data.filter((l) => l.employee_id === myEmployee?.id);
    }
    return data;
  }, [data, user, myEmployee]);

  const summary = useMemo(() => {
    return {
      total: scoped.length,
      pending: scoped.filter((l) => l.status.toLowerCase() === "pending").length,
      approved: scoped.filter((l) => l.status.toLowerCase() === "approved").length,
      rejected: scoped.filter((l) => l.status.toLowerCase() === "rejected").length,
    };
  }, [scoped]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scoped
      .filter((l) => {
        if (statusFilter && l.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
        if (q && !(l.employees?.nama_lengkap ?? "").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.id - a.id) // newest first
      .map((l, index) => ({ ...l, rowNumber: index + 1 }));
  }, [scoped, search, statusFilter]);

  const columns: ColumnDef<(typeof filtered)[number]>[] = useMemo(
    () => [
      {
        header: "No",
        accessorKey: "rowNumber",
        enableSorting: false,
        meta: { align: "center" },
        cell: (c) => <span className="text-text-secondary">{c.getValue<number>()}</span>,
      },
      { header: "Karyawan", id: "employee", accessorFn: (r) => r.employees?.nama_lengkap ?? "—" },
      { header: "Jenis", accessorKey: "jenis" },
      { header: "Mulai", id: "start", accessorFn: (r) => r.tanggal_mulai.slice(0, 10) },
      { header: "Selesai", id: "end", accessorFn: (r) => r.tanggal_selesai.slice(0, 10) },
      {
        header: "Alasan",
        accessorKey: "alasan",
        cell: (c) => <span className="line-clamp-1 max-w-[220px] block text-text-secondary">{c.getValue<string>() || "—"}</span>,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (c) => <StatusBadge status={c.getValue<string>()} />,
      },
      {
        header: "Aksi",
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => {
          const isPending = row.original.status.toLowerCase() === "pending";
          const canDeleteThis = isPending && (canApprove || row.original.employee_id === myEmployee?.id);
          const hasAnyAction = (canApprove && isPending) || canDeleteThis;
          if (!hasAnyAction) {
            return <span className="text-text-secondary">—</span>;
          }
          return (
            <TooltipProvider>
              <div className="flex items-center gap-1">
                {canApprove && isPending && (
                  <>
                    <Tooltip content="Setujui">
                      <button
                        onClick={() => setApproving(row.original)}
                        className="rounded-md p-1.5 text-success hover:bg-success-light"
                        aria-label="Setujui cuti"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Tolak">
                      <button
                        onClick={() => setRejecting(row.original)}
                        className="rounded-md p-1.5 text-danger hover:bg-danger-light"
                        aria-label="Tolak cuti"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  </>
                )}
                {/* Only Pending requests can be deleted — once approved/rejected, the
                    record is kept as history. */}
                {canDeleteThis && (
                  <Tooltip content="Hapus">
                    <button
                      onClick={() => setDeleting(row.original)}
                      className="rounded-md p-1.5 text-text-secondary hover:bg-danger-light hover:text-danger"
                      aria-label="Hapus pengajuan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          );
        },
      },
    ],
    [canApprove, myEmployee]
  );

  async function confirmApprove() {
    if (!approving) return;
    await updateStatusMutation.mutateAsync({ leave: approving, status: "Approved" });
    setApproving(null);
  }
  async function confirmReject() {
    if (!rejecting) return;
    await updateStatusMutation.mutateAsync({ leave: rejecting, status: "Rejected" });
    setRejecting(null);
  }
  async function confirmDelete() {
    if (!deleting) return;
    await deleteMutation.mutateAsync(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave"
        description={canApprove ? "Kelola pengajuan cuti dan izin seluruh karyawan." : "Ajukan dan pantau status cuti/izin Anda."}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajukan Cuti/Izin
          </Button>
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
            <StatCard label="Total Request" value={summary.total} icon={<FileText className="h-5 w-5" />} accent="primary" description="Total pengajuan" />
            <StatCard label="Approved" value={summary.approved} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" description="Pengajuan disetujui" />
            <StatCard label="Rejected" value={summary.rejected} icon={<XCircle className="h-5 w-5" />} accent="info" description="Pengajuan ditolak" />
            <StatCard label="Pending" value={summary.pending} icon={<Clock className="h-5 w-5" />} accent="warning" description="Menunggu tindakan" />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari karyawan..." className="w-full max-w-xs" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto max-w-[160px]" aria-label="Filter status">
          <option value="">Semua Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        getRowId={(r) => String(r.id)}
        emptyTitle="Belum ada pengajuan cuti"
        emptyDescription="Pengajuan cuti akan muncul di sini."
      />

      <LeaveFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(approving)}
        onOpenChange={(open) => !open && setApproving(null)}
        title="Setujui Pengajuan"
        description={
          approving?.jenis === "Cuti"
            ? `Pengajuan cuti dari "${approving?.employees?.nama_lengkap}" akan disetujui. Status karyawan akan otomatis berubah menjadi "On Leave" dan kembali ke "Active" saat masa cuti berakhir.`
            : `Pengajuan izin dari "${approving?.employees?.nama_lengkap}" akan disetujui.`
        }
        confirmLabel="Setujui"
        tone="primary"
        isLoading={updateStatusMutation.isPending}
        onConfirm={confirmApprove}
      />
      <ConfirmDialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
        title="Tolak Pengajuan"
        description={`Pengajuan dari "${rejecting?.employees?.nama_lengkap}" akan ditolak.`}
        confirmLabel="Tolak"
        isLoading={updateStatusMutation.isPending}
        onConfirm={confirmReject}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus Pengajuan"
        description="Pengajuan cuti ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
