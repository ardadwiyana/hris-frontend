import { axiosInstance } from "@/api/axios";
import type { CreateEmployeeResult, Employee, EmployeePayload } from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const { data } = await axiosInstance.get<ApiEnvelope<Employee[]>>("/employees");
    return data.data;
  },
  getById: async (id: number): Promise<Employee> => {
    const { data } = await axiosInstance.get<ApiEnvelope<Employee>>(`/employees/${id}`);
    return data.data;
  },
  create: async (payload: EmployeePayload): Promise<CreateEmployeeResult> => {
    const { data } = await axiosInstance.post<ApiEnvelope<CreateEmployeeResult>>("/employees", payload);
    return data.data;
  },
  update: async (id: number, payload: Partial<EmployeePayload>): Promise<Employee> => {
    const { data } = await axiosInstance.put<ApiEnvelope<Employee>>(`/employees/${id}`, payload);
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/employees/${id}`);
  },
};
