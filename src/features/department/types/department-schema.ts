import { z } from "zod";

export const departmentSchema = z.object({
  nama_departemen: z.string().min(2, "Nama departemen minimal 2 karakter"),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
