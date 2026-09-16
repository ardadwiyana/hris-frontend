import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck, CalendarClock, CalendarX, Umbrella } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { SearchInput } from "@/components/form/search-input";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { Avatar } from "@/components/ui/avatar";
import { useAttendances } from "../hooks/use-attendances";
import { useEmployees } from "@/features/employee/hooks/use-employees";
import { useDepartments } from "@/features/department/hooks/use-departments";
import { useLeaves } from "@/features/leave/hooks/use-leaves";
import { QuickAttendanceCard } from "../components/quick-attendance-card";
import type { Attendance } from "../types";
import { classifyAttendanceStatus, formatClockTime, resolveAttendanceStatus, todayDateString } from "@/utils/attendance";

export default function AttendancesPage() {
  const { data: attendances, isLoading, isError, refetch } = useAttendances();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: leaves } = useLeaves();

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(() => todayDateString());
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const employeeMap = useMemo(() => {
    const map = new Map<number, { nama_lengkap: string; nik: string; department_id: number | null }>();
    employees?.forEach((e) => map.set(e.id, { nama_lengkap: e.nama_lengkap, nik: e.nik, department_id: e.department_id }));
    return map;
  }, [employees]);

  const enriched = useMemo(() => {
    return (attendances ?? []).map((a) => {
      const emp = employeeMap.get(a.employee_id);
      return {
        ...a,
        employeeName: a.employees?.nama_lengkap ?? emp?.nama_lengkap ?? "—",
        employeeNik: a.employees?.nik ?? emp?.nik ?? "—",
        departmentId: emp?.department_id ?? null,
        status: resolveAttendanceStatus(a),
      };
    });
  }, [attendances, employeeMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter((a) => {
        if (dateFilter && a.tanggal.slice(0, 10) !== dateFilter) return false;
        if (departmentFilter && String(a.departmentId) !== departmentFilter) return false;
        if (statusFilter && classifyAttendanceStatus(a.status) !== statusFilter) return false;
        if (q && !a.employeeName.toLowerCase().includes(q) && !a.employeeNik.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        // Newest first: most recent date, then most recently recorded.
        const dateDiff = b.tanggal.localeCompare(a.tanggal);
        return dateDiff !== 0 ? dateDiff : b.id - a.id;
      })
      .map((a, index) => ({ ...a, rowNumber: index + 1 }));
  }, [enriched, search, dateFilter, departmentFilter, statusFilter]);
  
  const employeesOnLeaveToday = useMemo(() => {
      const set = new Set<number>();
      const todayStr = todayDateString();
      (leaves ?? []).forEach((l) => {
        if (
          l.jenis === "Cuti" &&
          l.status.toLowerCase() === "approved" &&
          l.tanggal_mulai.slice(0, 10) <= todayStr &&
          l.tanggal_selesai.slice(0, 10) >= todayStr
        ) {
          set.add(l.employee_id);
        }
      });
      return set;
    }, [leaves]);

  const todaysAttendanceByEmployee = useMemo(() => {
      const map = new Map<number, Attendance>();
      const todayStr = todayDateString();
      (attendances ?? [])
        .filter((a) => a.tanggal.slice(0, 10) === todayStr)
        .forEach((a) => map.set(a.employee_id, a));
      return map;
    }, [attendances]);    
  
    const attendanceOverview = useMemo(() => {
    let present = 0;
    let late = 0;
    let cuti = 0;
    let absent = 0;

    (employees ?? []).forEach((e) => {
      if (employeesOnLeaveToday.has(e.id)) {
        cuti += 1;
        return;
      }
      const rec = todaysAttendanceByEmployee.get(e.id);
      if (!rec) {
        absent += 1;
        return;
      }
      const bucket = classifyAttendanceStatus(resolveAttendanceStatus(rec));
      if (bucket === "present") present += 1;
      else if (bucket === "late") late += 1;
      else absent += 1;
    });
    const presentToday = present + late;
    return { 
      present, 
      late, 
      cuti, 
      absent, 
      presentToday 
    };
  }, [employees, employeesOnLeaveToday, todaysAttendanceByEmployee]);

  const columns: ColumnDef<(typeof filtered)[number]>[] = useMemo(
    () => [
      {
        header: "No",
        accessorKey: "rowNumber",
        enableSorting: false,
        meta: { align: "center" },
        cell: (c) => <span className="text-text-secondary">{c.getValue<number>()}</span>,
      },
      {
        header: "Karyawan",
        id: "employee",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.employeeName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{row.original.employeeName}</p>
              <p className="truncate text-xs text-text-secondary">{row.original.employeeNik}</p>
            </div>
          </div>
        ),
      },
      { header: "Tanggal", accessorKey: "tanggal", cell: (c) => c.getValue<string>().slice(0, 10) },
      {
        header: "Jam Masuk",
        id: "clock_in",
        accessorFn: (r) => formatClockTime(r.clock_in),
        cell: (c) => <span className="font-medium text-success">{c.getValue<string>()}</span>,
      },
      {
        header: "Jam Keluar",
        id: "clock_out",
        cell: ({ row }) =>
          row.original.clock_out ? (
            formatClockTime(row.original.clock_out)
          ) : (
            <span className="text-text-secondary">Belum clock out</span>
          ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" description="Catat dan pantau kehadiran karyawan harian." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present Today" value={attendanceOverview.presentToday} icon={<CalendarCheck className="h-5 w-5" />} accent="success" description="Hadir hari ini" />
        <StatCard label="Late" value={attendanceOverview.late} icon={<CalendarClock className="h-5 w-5" />} accent="warning" description="Karyawan terlambat" />
        <StatCard label="Absent" value={attendanceOverview.absent} icon={<CalendarX className="h-5 w-5" />} accent="danger" description="Tercatat tidak hadir" />
        <StatCard label="On Leave" value={attendanceOverview.cuti} icon={<Umbrella className="h-5 w-5" />} accent="info" description="Sedang cuti" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <QuickAttendanceCard />

        <div className="space-y-4">
          <div>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>Daftar absensi berdasarkan filter di bawah</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-auto"
              aria-label="Filter tanggal"
            />
            <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-auto max-w-[180px]" aria-label="Filter departemen">
              <option value="">Semua Departemen</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama_departemen}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto max-w-[160px]" aria-label="Filter status">
              <option value="">Semua Status</option>
              <option value="present">Hadir</option>
              <option value="late">Terlambat</option>
              <option value="absent">Tidak Hadir</option>
            </Select>
            <SearchInput value={search} onChange={setSearch} placeholder="Cari karyawan..." className="w-full max-w-[220px]" />
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            getRowId={(r) => String(r.id)}
            emptyTitle="Belum ada data absensi"
            emptyDescription="Gunakan Quick Attendance di samping untuk mencatat kehadiran karyawan."
          />
        </div>
      </div>
    </div>
  );
}
