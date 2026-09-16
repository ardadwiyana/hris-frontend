import { useEffect, useMemo, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/form-field";
import { useEmployees } from "@/features/employee/hooks/use-employees";
import { useAttendances, useRecordAttendance } from "../hooks/use-attendances";
import { computeLiveClockInStatus, nowAsBackendTime, todayDateString } from "@/utils/attendance";

export function QuickAttendanceCard() {
  const { data: employees } = useEmployees();
  const { data: attendances } = useAttendances();
  const recordMutation = useRecordAttendance();

  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Recomputed from the ticking clock so this rolls over to the next day
  // on its own at midnight, without needing a page refresh.
  const today = useMemo(() => todayDateString(now), [now]);

  const todaysRecord = useMemo(() => {
    if (!employeeId) return null;
    return (attendances ?? []).find((a) => a.employee_id === employeeId && a.tanggal.slice(0, 10) === today) ?? null;
  }, [attendances, employeeId, today]);

  const hasClockedIn = Boolean(todaysRecord?.clock_in);
  const hasClockedOut = Boolean(todaysRecord?.clock_out);

  const dateLabel = useMemo(
    () => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(now),
    [now]
  );
  const clockLabel = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
  }, [now]);

  const statusText = !employeeId
    ? "Pilih karyawan untuk mencatat kehadiran."
    : hasClockedIn && hasClockedOut
      ? "Absensi hari ini sudah lengkap."
      : hasClockedIn
        ? "Sudah clock in — belum melakukan clock out."
        : "Belum melakukan clock in hari ini.";

  async function handleClockIn() {
    if (!employeeId) return;
    await recordMutation.mutateAsync({
      employee_id: employeeId,
      tanggal: today,
      clock_in: nowAsBackendTime(new Date()),
      status: computeLiveClockInStatus(new Date()),
    });
  }

  async function handleClockOut() {
    if (!employeeId) return;
    await recordMutation.mutateAsync({
      employee_id: employeeId,
      tanggal: today,
      clock_out: nowAsBackendTime(new Date()),
    });
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div>
          <CardTitle>Quick Attendance</CardTitle>
          <CardDescription>Catat kehadiran karyawan secara manual</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <FormField label="Pilih karyawan" htmlFor="quick-attendance-employee">
          <Select
            id="quick-attendance-employee"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Pilih karyawan</option>
            {employees
              ?.slice() // Membuat salinan array agar data asli tidak termutasi
              ?.sort((a, b) => Number(a.nik) - Number(b.nik)) // Mengurutkan berdasarkan NIK (terkecil ke terbesar)
              ?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nik} — {emp.nama_lengkap} {emp.departments?.nama_departemen ? `(${emp.departments.nama_departemen})` : ""}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            onClick={handleClockIn}
            disabled={!employeeId || hasClockedIn}
            isLoading={recordMutation.isPending}
          >
            <LogIn className="h-4 w-4" />
            Clock In
          </Button>
          <Button
            variant="outlineDanger"
            onClick={handleClockOut}
            disabled={!employeeId || !hasClockedIn || hasClockedOut}
            isLoading={recordMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            Clock Out
          </Button>
        </div>

        <div className="space-y-1 border-t border-border pt-4 text-center">
          <p className="text-xs text-text-secondary">{dateLabel}</p>
          <p className="font-display text-3xl font-bold tabular-nums text-text-primary">{clockLabel}</p>
          <p className="text-xs text-text-secondary">{statusText}</p>
        </div>
      </CardContent>
    </Card>
  );
}
