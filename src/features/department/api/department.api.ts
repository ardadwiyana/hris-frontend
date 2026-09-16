import { axiosInstance } from "@/api/axios";
import type { Department, DepartmentPayload } from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const { data } = await axiosInstance.get<ApiEnvelope<Department[]>>("/departments");
    return data.data;
  },
  create: async (payload: DepartmentPayload): Promise<Department> => {
    const { data } = await axiosInstance.post<ApiEnvelope<Department>>("/departments", payload);
    return data.data;
  },
  update: async (id: number, payload: DepartmentPayload): Promise<Department> => {
    const { data } = await axiosInstance.put<ApiEnvelope<Department>>(`/departments/${id}`, payload);
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/departments/${id}`);
  },
};
