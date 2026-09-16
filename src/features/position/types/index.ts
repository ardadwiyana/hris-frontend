export interface Position {
  id: number;
  nama_posisi: string;
  department_id: number | null;
  departments?: { id: number; nama_departemen: string } | null;
  employees?: { id: number }[];
}

export interface PositionPayload {
  nama_posisi: string;
  department_id?: number | null;
}
