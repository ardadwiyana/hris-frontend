export interface Department {
  id: number;
  nama_departemen: string;
  employees?: { id: number }[];
}

export interface DepartmentPayload {
  nama_departemen: string;
}
