import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { leaveApi } from "../api/leave.api";
import type { Leave, LeavePayload } from "../types";
import { ApiError } from "@/api/axios";
import { employeeApi } from "@/features/employee/api/employee.api";
import { employeeKeys } from "@/features/employee/hooks/use-employees";
import { toEmployeePayload } from "@/features/employee/utils";
import type { Employee } from "@/features/employee/types";

export const leaveKeys = {
  all: ["leaves"] as const,
};

export function useLeaves() {
  return useQuery({
    queryKey: leaveKeys.all,
    queryFn: leaveApi.getAll,
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeavePayload) => leaveApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      toast.success("Pengajuan berhasil dikirim");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal mengirim pengajuan"),
  });
}

export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leave, status }: { leave: Leave; status: "Approved" | "Rejected" }) => {
      const updated = await leaveApi.updateStatus(leave.id, status);

      // Only "Cuti" moves the employee into On Leave status. "Izin" does not
      // change employment status — those days simply aren't excluded from
      // being counted absent, since there's no attendance record for them.
      if (status === "Approved" && leave.jenis === "Cuti") {
        const cachedEmployees = queryClient.getQueryData<Employee[]>(employeeKeys.all);
        const employee = cachedEmployees?.find((e) => e.id === leave.employee_id);
        if (employee && employee.status !== "On Leave") {
          await employeeApi.update(employee.id, toEmployeePayload(employee, { status: "On Leave" }));
        }
      }

      return updated;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      if (variables.status === "Approved" && variables.leave.jenis === "Cuti") {
        queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      }
      toast.success(variables.status === "Approved" ? "Pengajuan disetujui" : "Pengajuan ditolak");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal memperbarui status pengajuan"),
  });
}

export function useDeleteLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      toast.success("Pengajuan berhasil dihapus");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal menghapus pengajuan"),
  });
}
