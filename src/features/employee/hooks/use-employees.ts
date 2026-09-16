import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeeApi } from "../api/employee.api";
import type { EmployeePayload } from "../types";
import { ApiError } from "@/api/axios";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const employeeKeys = {
  all: ["employees"] as const,
  detail: (id: number) => ["employees", id] as const,
};

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.all,
    queryFn: employeeApi.getAll,
  });
}

export function useEmployee(id: number | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? 0),
    queryFn: () => employeeApi.getById(id as number),
    enabled: typeof id === "number" && !Number.isNaN(id),
  });
}

/**
 * Resolves the logged-in user's own employee record, so the navbar/profile
 * can show a real name instead of the raw username. There is no /auth/me
 * endpoint, so this matches employees.user_id against the auth user's id.
 */
export function useCurrentEmployee() {
  const { user } = useAuth();
  const { data: employees, ...rest } = useEmployees();
  const employee = employees?.find((e) => e.user_id === user?.id) ?? null;
  return { employee, ...rest };
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeePayload) => employeeApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Gagal menambahkan karyawan");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EmployeePayload> }) =>
      employeeApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      toast.success("Data karyawan berhasil diperbarui");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Gagal memperbarui data karyawan");
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Karyawan berhasil dihapus");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Gagal menghapus karyawan");
    },
  });
}
