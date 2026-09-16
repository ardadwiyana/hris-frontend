import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/form/search-input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDeleteUser, useUsers } from "../hooks/use-users";
import { UserFormDialog } from "../components/user-form-dialog";
import type { User } from "../types";

const ROLE_TONE: Record<string, "primary" | "info" | "gray"> = {
  admin: "primary",
  manager: "info",
  employee: "gray",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data, isLoading, isError, refetch } = useUsers();
  const deleteMutation = useDeleteUser();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data
      .filter((u) => !q || u.username.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id) // newest first
      .map((u, index) => ({ ...u, rowNumber: index + 1 }));
  }, [data, search]);

  const columns: ColumnDef<(typeof filtered)[number]>[] = useMemo(
    () => [
      {
        header: "No",
        accessorKey: "rowNumber",
        enableSorting: false,
        meta: { align: "center" },
        cell: (c) => <span className="text-text-secondary">{c.getValue<number>()}</span>,
      },
      { header: "User", accessorKey: "username" },
      {
        header: "Role",
        accessorKey: "role",
        cell: (c) => (
          <Badge tone={ROLE_TONE[c.getValue<string>()] ?? "gray"}>{c.getValue<string>()}</Badge>
        ),
      },
      {
        header: "Aksi",
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <TooltipProvider>
            <Tooltip content={row.original.id === currentUser?.id ? "Tidak dapat menghapus akun sendiri" : "Hapus"}>
              <button
                onClick={() => row.original.id !== currentUser?.id && setDeleting(row.original)}
                disabled={row.original.id === currentUser?.id}
                className="rounded-md p-1.5 text-text-secondary hover:bg-danger-light hover:text-danger disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label={`Hapus ${row.original.username}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Tooltip>
          </TooltipProvider>
        ),
      },
    ],
    [currentUser]
  );

  async function confirmDelete() {
    if (!deleting) return;
    await deleteMutation.mutateAsync(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Kelola akun login untuk mengakses sistem HRIS."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah User
          </Button>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Cari user..." className="max-w-xs" />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        getRowId={(r) => String(r.id)}
        emptyTitle="Belum ada user"
        emptyDescription="Tambahkan user pertama untuk memberi akses ke sistem."
      />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus User"
        description={`User "${deleting?.username}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
