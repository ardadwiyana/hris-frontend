export interface AttendanceEmployeeRef {
  nama_lengkap: string;
  nik: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  tanggal: string; // ISO date
  clock_in: string | null; // ISO datetime (time portion meaningful)
  clock_out: string | null;
  status: string | null; // free-form string column added on the backend (e.g. "Hadir", "Terlambat")
  employees?: AttendanceEmployeeRef;
}

export interface AttendancePayload {
  employee_id: number;
  tanggal: string; // yyyy-mm-dd
  clock_in?: string; // HH:mm:ss
  clock_out?: string; // HH:mm:ss
  status?: string;
}
