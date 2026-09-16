import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/form/form-field";
import { positionSchema, type PositionFormValues } from "../types/position-schema";
import type { Position } from "../types";
import { useCreatePosition, useUpdatePosition } from "../hooks/use-positions";
import { useDepartments } from "@/features/department/hooks/use-departments";

interface PositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Position | null;
}

export function PositionFormDialog({ open, onOpenChange, position }: PositionFormDialogProps) {
  const isEdit = Boolean(position);
  const { data: departments } = useDepartments();
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: { nama_posisi: "", department_id: undefined },
  });

  useEffect(() => {
    if (open) {
      reset({
        nama_posisi: position?.nama_posisi ?? "",
        department_id: position?.department_id ?? undefined,
      });
    }
  }, [open, position, reset]);

  async function onSubmit(values: PositionFormValues) {
    if (isEdit && position) {
      await updateMutation.mutateAsync({ id: position.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Posisi" : "Tambah Posisi"}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            {isEdit ? "Simpan Perubahan" : "Tambah Posisi"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Nama Posisi" htmlFor="nama_posisi" error={errors.nama_posisi?.message} required>
          <Input
            id="nama_posisi"
            placeholder="contoh: Software Engineer"
            hasError={Boolean(errors.nama_posisi)}
            {...register("nama_posisi")}
          />
        </FormField>

        <FormField label="Departemen" htmlFor="department_id" error={errors.department_id?.message} required>
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
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_departemen}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>
      </form>
    </Dialog>
  );
}
