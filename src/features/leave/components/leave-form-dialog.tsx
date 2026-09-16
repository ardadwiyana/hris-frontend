import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form/form-field";
import { leaveSchema, type LeaveFormValues } from "../types/leave-schema";
import { LEAVE_TYPES } from "../types";
import { useCreateLeave } from "../hooks/use-leaves";
import { useEmployees } from "@/features/employee/hooks/use-employees";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCurrentEmployee } from "@/features/employee/hooks/use-employees";

interface LeaveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveFormDialog({ open, onOpenChange }: LeaveFormDialogProps) {
  const { user } = useAuth();
  const isEmployeeRole = user?.role === "employee";
  const { data: employees } = useEmployees();
  const { employee: myEmployee } = useCurrentEmployee();
  const createMutation = useCreateLeave();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      employee_id: 0,
      jenis: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      alasan: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        employee_id: isEmployeeRole ? myEmployee?.id ?? 0 : 0,
        jenis: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        alasan: "",
      });
    }
  }, [open, isEmployeeRole, myEmployee, reset]);

  async function onSubmit(values: LeaveFormValues) {
    await createMutation.mutateAsync(values);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ajukan Cuti/Izin"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={createMutation.isPending}>
            Kirim Pengajuan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {!isEmployeeRole && (
          <FormField label="Karyawan" htmlFor="employee_id" error={errors.employee_id?.message} required>
            <Controller
              name="employee_id"
              control={control}
              render={({ field }) => (
                <Select
                  id="employee_id"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  hasError={Boolean(errors.employee_id)}
                >
                  <option value="">Pilih karyawan</option>
                  {employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nama_lengkap}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>
        )}

        <FormField label="Jenis Pengajuan" htmlFor="jenis" error={errors.jenis?.message} required>
          <Select id="jenis" hasError={Boolean(errors.jenis)} {...register("jenis")}>
            <option value="">Pilih jenis pengajuan</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tanggal Mulai" htmlFor="tanggal_mulai" error={errors.tanggal_mulai?.message} required>
            <Input id="tanggal_mulai" type="date" hasError={Boolean(errors.tanggal_mulai)} {...register("tanggal_mulai")} />
          </FormField>
          <FormField label="Tanggal Selesai" htmlFor="tanggal_selesai" error={errors.tanggal_selesai?.message} required>
            <Input id="tanggal_selesai" type="date" hasError={Boolean(errors.tanggal_selesai)} {...register("tanggal_selesai")} />
          </FormField>
        </div>

        <FormField label="Alasan" htmlFor="alasan" error={errors.alasan?.message} required>
          <Textarea id="alasan" placeholder="Jelaskan alasan pengajuan..." rows={3} {...register("alasan")} />
        </FormField>
      </form>
    </Dialog>
  );
}
