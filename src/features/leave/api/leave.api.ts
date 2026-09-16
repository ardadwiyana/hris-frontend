import { axiosInstance } from "@/api/axios";
import type { Leave, LeavePayload } from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const leaveApi = {
  getAll: async (): Promise<Leave[]> => {
    const { data } = await axiosInstance.get<ApiEnvelope<Leave[]>>("/leaves");
    return data.data;
  },
  create: async (payload: LeavePayload): Promise<Leave> => {
    const { data } = await axiosInstance.post<ApiEnvelope<Leave>>("/leaves", payload);
    return data.data;
  },
  updateStatus: async (id: number, status: "Approved" | "Rejected"): Promise<Leave> => {
    const { data } = await axiosInstance.patch<ApiEnvelope<Leave>>(`/leaves/${id}/status`, { status });
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/leaves/${id}`);
  },
};
