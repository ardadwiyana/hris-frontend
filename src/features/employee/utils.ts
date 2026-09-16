import type { Employee, EmployeePayload } from "./types";

/**
 * Builds a full EmployeePayload from an existing employee record, applying
 * overrides on top. Used for system-triggered updates (e.g. automatically
 * changing status on leave approval/expiry) where we only want to change
 * one field but the backend may expect the complete record on PUT.
 */
export function toEmployeePayload(employee: Employee, overrides: Partial<EmployeePayload> = {}): EmployeePayload {
  return {
    nik: employee.nik,
    nama_lengkap: employee.nama_lengkap,
    email: employee.email,
    telepon: employee.telepon ?? undefined,
    alamat: employee.alamat ?? undefined,
    jenis_kelamin: employee.jenis_kelamin ?? undefined,
    tanggal_lahir: employee.tanggal_lahir ? employee.tanggal_lahir.slice(0, 10) : undefined,
    department_id: employee.department_id ?? undefined,
    position_id: employee.position_id ?? undefined,
    tanggal_bergabung: employee.tanggal_bergabung.slice(0, 10),
    status: employee.status,
    ...overrides,
  };
}
