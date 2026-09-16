import { useMemo, useState } from "react";
import { Building2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/form/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDeleteDepartment, useDepartments } from "../hooks/use-departments";
import { DepartmentFormDialog } from "../components/department-form-dialog";
import type { Department } from "../types";

export default function DepartmentsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "manager";
  const { data, isLoading, isError, refetch } = useDepartments();
  const deleteMutation = useDeleteDepartment();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data
      .filter((d) => !q || d.nama_departemen.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id); // newest first
  }, [data, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(dept: Department) {
    setEditing(dept);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteMutation.mutateAsync(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Departments"
        description="Kelola daftar departemen di organisasi Anda."
        actions={
          canManage && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Departemen
            </Button>
          )
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Cari departemen..." className="max-w-xs" />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card>
          <ErrorState onRetry={() => refetch()} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada departemen"
            description="Tambahkan departemen pertama untuk mulai mengelompokkan karyawan."
            actionLabel={canManage ? "Tambah Departemen" : undefined}
            onAction={canManage ? openCreate : undefined}
          />
        </Card>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dept) => (
              <Card key={dept.id} className="p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                    <Building2 className="h-5 w-5" />
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Tooltip content="Edit">
                        <button
                          onClick={() => openEdit(dept)}
                          className="rounded-md p-1.5 text-text-secondary hover:bg-primary-light hover:text-primary-dark"
                          aria-label={`Edit ${dept.nama_departemen}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Hapus">
                        <button
                          onClick={() => setDeleting(dept)}
                          className="rounded-md p-1.5 text-text-secondary hover:bg-danger-light hover:text-danger"
                          aria-label={`Hapus ${dept.nama_departemen}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-text-primary">{dept.nama_departemen}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                  <Users className="h-3.5 w-3.5" />
                  {dept.employees?.length ?? 0} karyawan
                </p>
              </Card>
            ))}
          </div>
        </TooltipProvider>
      )}

      <DepartmentFormDialog open={formOpen} onOpenChange={setFormOpen} department={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus Departemen"
        description={`Departemen "${deleting?.nama_departemen}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
