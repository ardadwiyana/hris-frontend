import { z } from "zod";

export const positionSchema = z.object({
  nama_posisi: z.string().min(2, "Nama posisi minimal 2 karakter"),
  department_id: z.coerce.number().min(1, "Department harus dipilih"),
});

export type PositionFormValues = z.infer<typeof positionSchema>;
