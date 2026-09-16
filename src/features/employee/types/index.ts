export interface Department {
  id: number;
  nama_departemen: string;
}

export interface Position {
  id: number;
  nama_posisi: string;
  department_id?: number | null;
}

export interface Employee {
  id: number;
  user_id: number | null;
  nik: string;
  nama_lengkap: string;
  email: string;
  telepon: string | null;
  alamat: string | null;
  jenis_kelamin: string | null;
  tanggal_lahir: string | null; // ISO date string
  department_id: number | null;
  position_id: number | null;
  tanggal_bergabung: string; // ISO date string
  status: string;
  departments?: Department | null;
  positions?: Position | null;
  attendances?: unknown[];
  leaves?: unknown[];
}

export interface EmployeePayload {
  nik: string;
  nama_lengkap: string;
  email: string;
  telepon?: string;
  alamat?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string; // yyyy-mm-dd
  department_id?: number | null;
  position_id?: number | null;
  tanggal_bergabung: string; // yyyy-mm-dd
  status: string;
}

export interface CreateEmployeeResult {
  employee: Employee;
  generatedPassword: string;
}

export const EMPLOYMENT_STATUS_OPTIONS = ["Active", "Inactive", "On Leave"] as const;

// Assumed values — please confirm these match the exact strings your
// backend's Zod validation expects (e.g. it may use "L"/"P" instead).
export const GENDER_OPTIONS = ["Laki-laki", "Perempuan"] as const;
