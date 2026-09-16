import { useEffect, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form/form-field";
import { employeeSchema, type EmployeeFormValues } from "../types/employee-schema";
import { EMPLOYMENT_STATUS_OPTIONS, GENDER_OPTIONS, type CreateEmployeeResult, type Employee } from "../types";
import { useCreateEmployee, useUpdateEmployee } from "../hooks/use-employees";
import { useDepartments } from "@/features/department/hooks/use-departments";
import { todayDateString } from "@/utils/attendance";
import { usePositions } from "@/features/position/hooks/use-positions";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onCreated?: (result: CreateEmployeeResult) => void;
}

export function EmployeeFormDialog({ open, onOpenChange, employee, onCreated }: EmployeeFormDialogProps) {
  const isEdit = Boolean(employee);
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nik: "",
      nama_lengkap: "",
      email: "",
      telepon: "",
      alamat: "",
      jenis_kelamin: undefined,
      tanggal_lahir: "",
      tanggal_bergabung: todayDateString(),
      status: "Active",
    },
  });

  const selectedDepartmentId = useWatch({ control, name: "department_id" });

  // Positions are now linked to a department — narrow the choices once a
  // department is picked, but fall back to showing everything so positions
  // without a department assigned (or before one is chosen) stay selectable.
  const availablePositions = useMemo(() => {
    if (!positions) return [];
    if (!selectedDepartmentId) return positions;
    return positions.filter((p) => !p.department_id || p.department_id === selectedDepartmentId);
  }, [positions, selectedDepartmentId]);

  useEffect(() => {
    if (open) {
      reset({
        nik: employee?.nik ?? "",
        nama_lengkap: employee?.nama_lengkap ?? "",
        email: employee?.email ?? "",
        telepon: employee?.telepon ?? "",
        alamat: employee?.alamat ?? "",
        jenis_kelamin: (employee?.jenis_kelamin as EmployeeFormValues["jenis_kelamin"]) ?? undefined,
        tanggal_lahir: employee?.tanggal_lahir ? employee.tanggal_lahir.slice(0, 10) : "",
        department_id: employee?.department_id ?? undefined,
        position_id: employee?.position_id ?? undefined,
        tanggal_bergabung: employee ? employee.tanggal_bergabung.slice(0, 10) : todayDateString(),
        status: (employee?.status as EmployeeFormValues["status"]) ?? "Active",
      });
    }
  }, [open, employee, reset]);

  async function onSubmit(values: EmployeeFormValues) {
    if (isEdit && employee) {
      await updateMutation.mutateAsync({ id: employee.id, payload: values });
      onOpenChange(false);
    } else {
      const result = await createMutation.mutateAsync(values);
      onOpenChange(false);
      onCreated?.(result);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Karyawan" : "Tambah Karyawan"}
      description={isEdit ? undefined : "Akun login akan dibuat otomatis untuk karyawan ini."}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEdit ? "Simpan Perubahan" : "Tambah Karyawan"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <FormField label="NIK" htmlFor="nik" error={errors.nik?.message} required>
          <Input id="nik" placeholder="Nomor Induk Karyawan" hasError={Boolean(errors.nik)} {...register("nik")} />
        </FormField>

        <FormField label="Nama Lengkap" htmlFor="nama_lengkap" error={errors.nama_lengkap?.message} required>
          <Input id="nama_lengkap" placeholder="Nama lengkap karyawan" hasError={Boolean(errors.nama_lengkap)} {...register("nama_lengkap")} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="nama@perusahaan.com" hasError={Boolean(errors.email)} {...register("email")} />
        </FormField>

        <FormField label="Telepon" htmlFor="telepon" error={errors.telepon?.message}>
          <Input id="telepon" placeholder="08xxxxxxxxxx" {...register("telepon")} />
        </FormField>

        <FormField label="Jenis Kelamin" htmlFor="jenis_kelamin" error={errors.jenis_kelamin?.message} required>
          <Select id="jenis_kelamin" hasError={Boolean(errors.jenis_kelamin)} {...register("jenis_kelamin")}>
            <option value="">Pilih jenis kelamin</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Tanggal Lahir" htmlFor="tanggal_lahir" error={errors.tanggal_lahir?.message}>
          <Input id="tanggal_lahir" type="date" hasError={Boolean(errors.tanggal_lahir)} {...register("tanggal_lahir")} />
        </FormField>

        <FormField label="Departemen" htmlFor="department_id" error={errors.department_id?.message}>
          <Controller
            name="department_id"
            control={control}
            render={({ field }) => (
              <Select
                id="department_id"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Pilih departemen</option>
                {departments
                  ?.slice() // Menyalin array agar tidak memodifikasi array asli (best practice di React)
                  ?.sort((a, b) => a.nama_departemen.localeCompare(b.nama_departemen))
                  ?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama_departemen}
                    </option>
                  ))}
              </Select>
            )}
          />
        </FormField>

        <FormField label="Posisi" htmlFor="position_id" error={errors.position_id?.message}>
          <Controller
            name="position_id"
            control={control}
            render={({ field }) => (
              <Select
                id="position_id"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Pilih posisi</option>
                {availablePositions
                  .slice() // Menyalin array agar tidak memodifikasi array asli (best practice di React)
                  ?.sort((a, b) => a.nama_posisi.localeCompare(b.nama_posisi))
                  ?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_posisi}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>

        <FormField label="Tanggal Bergabung" htmlFor="tanggal_bergabung" error={errors.tanggal_bergabung?.message} required>
          <Input id="tanggal_bergabung" type="date" hasError={Boolean(errors.tanggal_bergabung)} {...register("tanggal_bergabung")} />
        </FormField>

        <FormField label="Status Kepegawaian" htmlFor="status" error={errors.status?.message} required>
          <Select id="status" hasError={Boolean(errors.status)} {...register("status")}>
            {EMPLOYMENT_STATUS_OPTIONS.filter((s) => s !== "On Leave").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Alamat" htmlFor="alamat" error={errors.alamat?.message} className="sm:col-span-2">
          <Textarea id="alamat" placeholder="Alamat domisili" rows={2} {...register("alamat")} />
        </FormField>
      </form>
    </Dialog>
  );
}
