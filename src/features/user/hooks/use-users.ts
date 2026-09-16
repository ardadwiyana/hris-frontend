import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userApi } from "../api/user.api";
import type { CreateUserPayload } from "../types";
import { ApiError } from "@/api/axios";

export const userKeys = {
  all: ["users"] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: userApi.getAll,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User berhasil dibuat");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal membuat user"),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User berhasil dihapus");
    },
    onError: (error: ApiError) => toast.error(error.message || "Gagal menghapus user"),
  });
}
