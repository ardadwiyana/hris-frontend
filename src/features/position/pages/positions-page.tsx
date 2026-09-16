import { useMemo, useState } from "react";
import { BriefcaseBusiness, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { useDeletePosition, usePositions } from "../hooks/use-positions";
import { PositionFormDialog } from "../components/position-form-dialog";
import type { Position } from "../types";

export default function PositionsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "manager";
  const { data, isLoading, isError, refetch } = usePositions();
  const deleteMutation = useDeletePosition();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [deleting, setDeleting] = useState<Position | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data
      .filter((p) => !q || p.nama_posisi.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id); // newest first
  }, [data, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(position: Position) {
    setEditing(position);
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
        title="Positions"
        description="Kelola daftar posisi/jabatan karyawan."
        actions={
          canManage && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Posisi
            </Button>
          )
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Cari posisi..." className="max-w-xs" />

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
            title="Belum ada posisi"
            description="Tambahkan posisi pertama untuk digunakan pada data karyawan."
            actionLabel={canManage ? "Tambah Posisi" : undefined}
            onAction={canManage ? openCreate : undefined}
          />
        </Card>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((position) => (
              <Card key={position.id} className="p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Tooltip content="Edit">
                        <button
                          onClick={() => openEdit(position)}
                          className="rounded-md p-1.5 text-text-secondary hover:bg-primary-light hover:text-primary-dark"
                          aria-label={`Edit ${position.nama_posisi}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Hapus">
                        <button
                          onClick={() => setDeleting(position)}
                          className="rounded-md p-1.5 text-text-secondary hover:bg-danger-light hover:text-danger"
                          aria-label={`Hapus ${position.nama_posisi}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-text-primary">{position.nama_posisi}</h3>
                <div className="mt-1.5">
                  {position.departments?.nama_departemen ? (
                    <Badge tone="info">{position.departments.nama_departemen}</Badge>
                  ) : (
                    <span className="text-xs text-text-secondary">Tanpa departemen</span>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
                  <Users className="h-3.5 w-3.5" />
                  {position.employees?.length ?? 0} karyawan
                </p>
              </Card>
            ))}
          </div>
        </TooltipProvider>
      )}

      <PositionFormDialog open={formOpen} onOpenChange={setFormOpen} position={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus Posisi"
        description={`Posisi "${deleting?.nama_posisi}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
