import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/form/form-field";
import { createUserSchema, type CreateUserFormValues } from "../types/user-schema";
import { useCreateUser } from "../hooks/use-users";
import { ROLES } from "@/constants/auth";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

export function UserFormDialog({ open, onOpenChange }: UserFormDialogProps) {
  const createMutation = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: "", password: "", role: "employee" },
  });

  useEffect(() => {
    if (open) {
      reset({ username: "", password: "", role: "employee" });
      setShowPassword(false);
    }
  }, [open, reset]);

  async function onSubmit(values: CreateUserFormValues) {
    await createMutation.mutateAsync(values);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah User"
      description="Membuat akun login baru secara langsung. Untuk karyawan baru, sebaiknya gunakan halaman Employees agar akun tertaut otomatis."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={createMutation.isPending}>
            Tambah User
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" htmlFor="username" error={errors.username?.message} required>
          <Input id="username" type="email" placeholder="nama@perusahaan.com" hasError={Boolean(errors.username)} {...register("username")} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              className="pr-10"
              hasError={Boolean(errors.password)}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-dark"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="Role" htmlFor="role" error={errors.role?.message} required>
          <Select id="role" hasError={Boolean(errors.role)} {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </Select>
        </FormField>
      </form>
    </Dialog>
  );
}
