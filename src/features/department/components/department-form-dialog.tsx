import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form/form-field";
import { departmentSchema, type DepartmentFormValues } from "../types/department-schema";
import type { Department } from "../types";
import { useCreateDepartment, useUpdateDepartment } from "../hooks/use-departments";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}

export function DepartmentFormDialog({ open, onOpenChange, department }: DepartmentFormDialogProps) {
  const isEdit = Boolean(department);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { nama_departemen: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ nama_departemen: department?.nama_departemen ?? "" });
    }
  }, [open, department, reset]);

  async function onSubmit(values: DepartmentFormValues) {
    if (isEdit && department) {
      await updateMutation.mutateAsync({ id: department.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Departemen" : "Tambah Departemen"}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEdit ? "Simpan Perubahan" : "Tambah Departemen"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Nama Departemen" htmlFor="nama_departemen" error={errors.nama_departemen?.message} required>
          <Input
            id="nama_departemen"
            placeholder="contoh: Human Resources"
            hasError={Boolean(errors.nama_departemen)}
            {...register("nama_departemen")}
          />
        </FormField>
      </form>
    </Dialog>
  );
}
