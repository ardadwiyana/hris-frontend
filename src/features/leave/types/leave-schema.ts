import { z } from "zod";

export const leaveSchema = z
  .object({
    employee_id: z.coerce.number().min(1, "Karyawan wajib dipilih"),
    jenis: z.string().min(1, "Jenis cuti wajib dipilih"),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi"),
    alasan: z.string().max(500, "Alasan maksimal 500 karakter").min(1, "Alasan wajib diisi"),
  })
  .refine((data) => data.tanggal_selesai >= data.tanggal_mulai, {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    path: ["tanggal_selesai"],
  });

export type LeaveFormValues = z.infer<typeof leaveSchema>;
