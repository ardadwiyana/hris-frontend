import { useMemo, useState } from "react";
import { Building2, BriefcaseBusiness, Pencil, Plus, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/form/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDeleteDepartment, useDepartments } from "../hooks/use-departments";
import { DepartmentFormDialog } from "../components/department-form-dialog";
import type { Department } from "../types";
import { useDeletePosition, usePositions } from "@/features/position/hooks/use-positions";
import { PositionFormDialog } from "@/features/position/components/position-form-dialog";
import type { Position } from "@/features/position/types";

type Tab = "departments" | "positions";

export default function OrganizationPage() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "manager";

  const [tab, setTab] = useState<Tab>("departments");
  const [search, setSearch] = useState("");

  // Departments state
  const { data: departments, isLoading: loadingDepartments, isError: errorDepartments, refetch: refetchDepartments } = useDepartments();
  const deleteDepartmentMutation = useDeleteDepartment();
  const [deptFormOpen, setDeptFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  // Positions state
  const { data: positions, isLoading: loadingPositions, isError: errorPositions, refetch: refetchPositions } = usePositions();
  const deletePositionMutation = useDeletePosition();
  const [posFormOpen, setPosFormOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [deletingPos, setDeletingPos] = useState<Position | null>(null);

  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    const q = search.trim().toLowerCase();
    return departments
      .filter((d) => !q || d.nama_departemen.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id);
  }, [departments, search]);

  const filteredPositions = useMemo(() => {
    if (!positions) return [];
    const q = search.trim().toLowerCase();
    return positions
      .filter((p) => !q || p.nama_posisi.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id);
  }, [positions, search]);

  function switchTab(next: Tab) {
    setTab(next);
    setSearch("");
  }

  async function confirmDeleteDept() {
    if (!deletingDept) return;
    await deleteDepartmentMutation.mutateAsync(deletingDept.id);
    setDeletingDept(null);
  }

  async function confirmDeletePos() {
    if (!deletingPos) return;
    await deletePositionMutation.mutateAsync(deletingPos.id);
    setDeletingPos(null);
  }

  const isDepartments = tab === "departments";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Departments & Positions"
        description={
          isDepartments
            ? "Kelola daftar departemen di organisasi Anda."
            : "Kelola daftar posisi/jabatan karyawan."
        }
        actions={
          canManage &&
          (isDepartments ? (
            <Button
              onClick={() => {
                setEditingDept(null);
                setDeptFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Tambah Departemen
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEditingPos(null);
                setPosFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Tambah Posisi
            </Button>
          ))
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* Segmented tab switcher */}
        <div className="inline-flex items-center gap-1 rounded-[var(--radius-control)] bg-primary-light/50 p-1">
          <button
            type="button"
            onClick={() => switchTab("departments")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[calc(var(--radius-control)-2px)] px-3.5 py-1.5 text-sm font-medium transition-all",
              isDepartments ? "bg-card text-primary-dark shadow-sm" : "text-text-secondary hover:text-primary-dark"
            )}
          >
            <Building2 className="h-4 w-4" />
            Departments
          </button>
          <button
            type="button"
            onClick={() => switchTab("positions")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[calc(var(--radius-control)-2px)] px-3.5 py-1.5 text-sm font-medium transition-all",
              !isDepartments ? "bg-card text-primary-dark shadow-sm" : "text-text-secondary hover:text-primary-dark"
            )}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Positions
          </button>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={isDepartments ? "Cari departemen..." : "Cari posisi..."}
          className="max-w-xs"
        />
      </div>

      {isDepartments ? (
        loadingDepartments ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="mt-4 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </Card>
            ))}
          </div>
        ) : errorDepartments ? (
          <Card>
            <ErrorState onRetry={() => refetchDepartments()} />
          </Card>
        ) : filteredDepartments.length === 0 ? (
          <Card>
            <EmptyState
              title="Belum ada departemen"
              description="Tambahkan departemen pertama untuk mulai mengelompokkan karyawan."
              actionLabel={canManage ? "Tambah Departemen" : undefined}
              onAction={
                canManage
                  ? () => {
                      setEditingDept(null);
                      setDeptFormOpen(true);
                    }
                  : undefined
              }
            />
          </Card>
        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDepartments.map((dept) => (
                <Card key={dept.id} className="p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                      <Building2 className="h-5 w-5" />
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <Tooltip content="Edit">
                          <button
                            onClick={() => {
                              setEditingDept(dept);
                              setDeptFormOpen(true);
                            }}
                            className="rounded-md p-1.5 text-text-secondary hover:bg-primary-light hover:text-primary-dark"
                            aria-label={`Edit ${dept.nama_departemen}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Hapus">
                          <button
                            onClick={() => setDeletingDept(dept)}
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
        )
      ) : loadingPositions ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </Card>
          ))}
        </div>
      ) : errorPositions ? (
        <Card>
          <ErrorState onRetry={() => refetchPositions()} />
        </Card>
      ) : filteredPositions.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada posisi"
            description="Tambahkan posisi pertama untuk digunakan pada data karyawan."
            actionLabel={canManage ? "Tambah Posisi" : undefined}
            onAction={
              canManage
                ? () => {
                    setEditingPos(null);
                    setPosFormOpen(true);
                  }
                : undefined
            }
          />
        </Card>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPositions.map((position) => (
              <Card key={position.id} className="p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Tooltip content="Edit">
                        <button
                          onClick={() => {
                            setEditingPos(position);
                            setPosFormOpen(true);
                          }}
                          className="rounded-md p-1.5 text-text-secondary hover:bg-primary-light hover:text-primary-dark"
                          aria-label={`Edit ${position.nama_posisi}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Hapus">
                        <button
                          onClick={() => setDeletingPos(position)}
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
                    <span className="text-xs text-text-secondary">Tanpa Departemen</span>
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

      <DepartmentFormDialog open={deptFormOpen} onOpenChange={setDeptFormOpen} department={editingDept} />
      <PositionFormDialog open={posFormOpen} onOpenChange={setPosFormOpen} position={editingPos} />

      <ConfirmDialog
        open={Boolean(deletingDept)}
        onOpenChange={(open) => !open && setDeletingDept(null)}
        title="Hapus Departemen"
        description={`Departemen "${deletingDept?.nama_departemen}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        isLoading={deleteDepartmentMutation.isPending}
        onConfirm={confirmDeleteDept}
      />
      <ConfirmDialog
        open={Boolean(deletingPos)}
        onOpenChange={(open) => !open && setDeletingPos(null)}
        title="Hapus Posisi"
        description={`Posisi "${deletingPos?.nama_posisi}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        isLoading={deletePositionMutation.isPending}
        onConfirm={confirmDeletePos}
      />
    </div>
  );
}
