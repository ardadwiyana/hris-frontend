import { z } from "zod";

export const attendanceSchema = z
  .object({
    employee_id: z.coerce.number().min(1, "Karyawan wajib dipilih"),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    clock_in: z.string().optional(),
    clock_out: z.string().optional(),
  })
  .refine((data) => data.clock_in || data.clock_out, {
    message: "Isi minimal salah satu: jam masuk atau jam pulang",
    path: ["clock_in"],
  });

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;
