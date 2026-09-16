import { axiosInstance } from "@/api/axios";
import type { Attendance, AttendancePayload } from "../types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const attendanceApi = {
  getAll: async (): Promise<Attendance[]> => {
    const { data } = await axiosInstance.get<ApiEnvelope<Attendance[]>>("/attendances");
    return data.data;
  },
  // POST doubles as create or update, keyed by (employee_id, tanggal) on the backend.
  recordAttendance: async (payload: AttendancePayload): Promise<Attendance> => {
    const { data } = await axiosInstance.post<ApiEnvelope<Attendance>>("/attendances", payload);
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/attendances/${id}`);
  },
};
