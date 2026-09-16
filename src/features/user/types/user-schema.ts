import { z } from "zod";
import { ROLES } from "@/constants/auth";

export const createUserSchema = z.object({
  username: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(ROLES, { errorMap: () => ({ message: "Role wajib dipilih" }) }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
