import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { positionApi } from "../api/position.api";
import type { PositionPayload } from "../types";
import { ApiError } from "@/api/axios";
import { employeeKeys } from "@/features/employee/hooks/use-employees";

export const positionKeys = {
  all: ["positions"] as const,
};

export function usePositions() {
  return useQuery({
    queryKey: positionKeys.all,
    queryFn: positionApi.getAll,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PositionPayload) => positionApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
      toast.success("Posisi berhasil ditambahkan");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal menambahkan posisi"),
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PositionPayload }) =>
      positionApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Posisi berhasil diperbarui");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal memperbarui posisi"),
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => positionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
      toast.success("Posisi berhasil dihapus");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal menghapus posisi"),
  });
}
