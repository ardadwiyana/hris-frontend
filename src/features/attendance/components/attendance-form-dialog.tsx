import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/form/form-field";
import { attendanceSchema, type AttendanceFormValues } from "../types/attendance-schema";
import { useRecordAttendance } from "../hooks/use-attendances";
import { useEmployees } from "@/features/employee/hooks/use-employees";
import { toBackendTime, todayDateString, toTimeInputValue } from "@/utils/attendance";
import type { Attendance } from "../types";

interface AttendanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Attendance | null;
}

export function AttendanceFormDialog({ open, onOpenChange, editing }: AttendanceFormDialogProps) {
  const { data: employees } = useEmployees();
  const recordMutation = useRecordAttendance();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employee_id: 0,
      tanggal: todayDateString(),
      clock_in: "",
      clock_out: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        employee_id: editing?.employee_id ?? 0,
        tanggal: editing ? editing.tanggal.slice(0, 10) : todayDateString(),
        clock_in: toTimeInputValue(editing?.clock_in ?? null),
        clock_out: toTimeInputValue(editing?.clock_out ?? null),
      });
    }
  }, [open, editing, reset]);

  async function onSubmit(values: AttendanceFormValues) {
    await recordMutation.mutateAsync({
      employee_id: values.employee_id,
      tanggal: values.tanggal,
      clock_in: values.clock_in ? toBackendTime(values.clock_in) : undefined,
      clock_out: values.clock_out ? toBackendTime(values.clock_out) : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Catat Absensi"
      description="Satu data absensi berlaku per karyawan, per tanggal. Menyimpan ulang tanggal yang sama akan memperbarui data tersebut."
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={recordMutation.isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={recordMutation.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                disabled={Boolean(editing)}
              >
                <option value="">Pilih karyawan</option>
                {employees?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nama_lengkap} — {emp.nik}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>

        <FormField label="Tanggal" htmlFor="tanggal" error={errors.tanggal?.message} required>
          <Input id="tanggal" type="date" hasError={Boolean(errors.tanggal)} {...register("tanggal")} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Jam Masuk" htmlFor="clock_in" error={errors.clock_in?.message}>
            <Input id="clock_in" type="time" hasError={Boolean(errors.clock_in)} {...register("clock_in")} />
          </FormField>
          <FormField label="Jam Pulang" htmlFor="clock_out">
            <Input id="clock_out" type="time" {...register("clock_out")} />
          </FormField>
        </div>
      </form>
    </Dialog>
  );
}
