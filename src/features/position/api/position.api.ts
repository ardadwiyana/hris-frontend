import { axiosInstance } from "@/api/axios";
import type { Position, PositionPayload } from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const positionApi = {
  getAll: async (): Promise<Position[]> => {
    const { data } = await axiosInstance.get<ApiEnvelope<Position[]>>("/positions");
    return data.data;
  },
  create: async (payload: PositionPayload): Promise<Position> => {
    const { data } = await axiosInstance.post<ApiEnvelope<Position>>("/positions", payload);
    return data.data;
  },
  update: async (id: number, payload: PositionPayload): Promise<Position> => {
    const { data } = await axiosInstance.put<ApiEnvelope<Position>>(`/positions/${id}`, payload);
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/positions/${id}`);
  },
};
