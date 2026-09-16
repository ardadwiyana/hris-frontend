import { axiosInstance } from "@/api/axios";
import type { LoginPayload, LoginResponse } from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<ApiEnvelope<LoginResponse>>(
      "/auth/login",
      payload
    );
    return data.data;
  },
};
