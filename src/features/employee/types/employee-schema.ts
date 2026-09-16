import { z } from "zod";
import { EMPLOYMENT_STATUS_OPTIONS, GENDER_OPTIONS } from "./index";

export const employeeSchema = z.object({
  nik: z.string().min(3, "NIK minimal 3 karakter"),
  nama_lengkap: z.string().min(2, "Nama wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
  jenis_kelamin: z.enum(GENDER_OPTIONS).optional(),
  tanggal_lahir: z.string().optional(),
  department_id: z.coerce.number().optional(),
  position_id: z.coerce.number().optional(),
  tanggal_bergabung: z.string().min(1, "Tanggal bergabung wajib diisi"),
  status: z.enum(EMPLOYMENT_STATUS_OPTIONS, { errorMap: () => ({ message: "Status wajib dipilih" }) }),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
