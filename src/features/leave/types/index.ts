export interface LeaveEmployeeRef {
  nama_lengkap: string;
  nik: string;
}

export interface Leave {
  id: number;
  employee_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jenis: string;
  alasan: string | null;
  status: string; // "Pending" | "Approved" | "Rejected" (free string on backend)
  employees?: LeaveEmployeeRef;
}

export interface LeavePayload {
  employee_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jenis: string;
  alasan?: string;
}

export const LEAVE_TYPES = ["Cuti", "Izin"] as const;
