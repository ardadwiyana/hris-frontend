import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone, Building2, BriefcaseBusiness, CalendarDays, IdCard, Cake, VenusAndMars } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEmployee } from "../hooks/use-employees";
import { useAttendances } from "@/features/attendance/hooks/use-attendances";
import { useLeaves } from "@/features/leave/hooks/use-leaves";
import { classifyAttendanceStatus, resolveAttendanceStatus } from "@/utils/attendance";

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="truncate text-sm font-medium text-text-primary">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = Number(id);

  const { data: employee, isLoading, isError, refetch } = useEmployee(employeeId);
  const { data: attendances } = useAttendances();
  const { data: leaves } = useLeaves();

  const attendanceSummary = useMemo(() => {
    const mine = (attendances ?? []).filter((a) => a.employee_id === employeeId);
    return {
      total: mine.length,
      present: mine.filter((a) => classifyAttendanceStatus(resolveAttendanceStatus(a)) === "present").length,
      late: mine.filter((a) => classifyAttendanceStatus(resolveAttendanceStatus(a)) === "late").length,
      absent: mine.filter((a) => classifyAttendanceStatus(resolveAttendanceStatus(a)) === "absent").length,
    };
  }, [attendances, employeeId]);

  const leaveSummary = useMemo(() => {
    const mine = (leaves ?? []).filter((l) => l.employee_id === employeeId);
    return {
      total: mine.length,
      approved: mine.filter((l) => l.status.toLowerCase() === "approved").length,
      pending: mine.filter((l) => l.status.toLowerCase() === "pending").length,
      rejected: mine.filter((l) => l.status.toLowerCase() === "rejected").length,
    };
  }, [leaves, employeeId]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <Card className="p-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="mt-4 h-4 w-1/3" />
        </Card>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <Card>
        <ErrorState
          title="Karyawan tidak ditemukan"
          description="Data karyawan tidak dapat dimuat atau tidak tersedia."
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate("/employees")}>
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Employees
      </Button>

      {/* Profile header */}
      <Card className="p-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar name={employee.nama_lengkap} className="h-16 w-16 text-lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-text-primary">{employee.nama_lengkap}</h1>
            <p className="text-sm text-text-secondary">NIK {employee.nik}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {employee.departments?.nama_departemen ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                {employee.positions?.nama_posisi ?? "—"}
              </span>
            </div>
          </div>
          <StatusBadge status={employee.status} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={VenusAndMars} label="Jenis Kelamin" value={employee.jenis_kelamin ?? ""} />
            <InfoRow
              icon={Cake}
              label="Tanggal Lahir"
              value={employee.tanggal_lahir ? employee.tanggal_lahir.slice(0, 10) : ""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Mail} label="Email" value={employee.email} />
            <InfoRow icon={Phone} label="Telepon" value={employee.telepon ?? ""} />
            <InfoRow icon={MapPin} label="Alamat" value={employee.alamat ?? ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Kepegawaian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={IdCard} label="NIK" value={employee.nik} />
            <InfoRow
              icon={CalendarDays}
              label="Tanggal Bergabung"
              value={employee.tanggal_bergabung.slice(0, 10)}
            />
            <InfoRow icon={BriefcaseBusiness} label="Posisi" value={employee.positions?.nama_posisi ?? ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold text-success">{attendanceSummary.present}</p>
                <p className="text-xs text-text-secondary">Present</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-warning">{attendanceSummary.late}</p>
                <p className="text-xs text-text-secondary">Late</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-danger">{attendanceSummary.absent}</p>
                <p className="text-xs text-text-secondary">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Cuti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold text-success">{leaveSummary.approved}</p>
                <p className="text-xs text-text-secondary">Approved</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-warning">{leaveSummary.pending}</p>
                <p className="text-xs text-text-secondary">Pending</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-danger">{leaveSummary.rejected}</p>
                <p className="text-xs text-text-secondary">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
