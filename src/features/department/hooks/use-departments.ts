import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { departmentApi } from "../api/department.api";
import type { DepartmentPayload } from "../types";
import { ApiError } from "@/api/axios";
import { employeeKeys } from "@/features/employee/hooks/use-employees";

export const departmentKeys = {
  all: ["departments"] as const,
};

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.all,
    queryFn: departmentApi.getAll,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepartmentPayload) => departmentApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success("Departemen berhasil ditambahkan");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal menambahkan departemen"),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DepartmentPayload }) =>
      departmentApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Departemen berhasil diperbarui");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal memperbarui departemen"),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success("Departemen berhasil dihapus");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal menghapus departemen"),
  });
}
