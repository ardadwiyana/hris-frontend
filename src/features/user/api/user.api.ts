import { axiosInstance } from "@/api/axios";
import type { CreateUserPayload, User } from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get<ApiEnvelope<User[]>>("/users");
    return data.data;
  },
  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await axiosInstance.post<ApiEnvelope<User>>("/users", payload);
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};
