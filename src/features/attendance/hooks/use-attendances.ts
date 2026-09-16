import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attendanceApi } from "../api/attendance.api";
import type { AttendancePayload } from "../types";
import { ApiError } from "@/api/axios";

export const attendanceKeys = {
  all: ["attendances"] as const,
};

export function useAttendances() {
  return useQuery({
    queryKey: attendanceKeys.all,
    queryFn: attendanceApi.getAll,
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttendancePayload) => attendanceApi.recordAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success("Absensi berhasil disimpan");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal menyimpan absensi"),
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success("Absensi berhasil dihapus");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal menghapus absensi"),
  });
}
