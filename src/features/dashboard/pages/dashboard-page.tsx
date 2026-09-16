import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Building2, CalendarCheck, ClipboardList, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { useEmployees } from "@/features/employee/hooks/use-employees";
import { useDepartments } from "@/features/department/hooks/use-departments";
import { useAttendances } from "@/features/attendance/hooks/use-attendances";
import { useLeaves } from "@/features/leave/hooks/use-leaves";
import type { Attendance } from "@/features/attendance/types";
import { classifyAttendanceStatus, formatClockTimeWithSeconds, resolveAttendanceStatus, todayDateString } from "@/utils/attendance";

const COLORS = {
  present: "#57A65B",
  late: "#E8B866",
  absent: "#D64545",
  cuti: "#A583E0",
  dept: ["#2FA36B", "#76A9D8", "#A583E0", "#57A65B", "#6BC79A", "#E8B866"],
};

export default function DashboardPage() {
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const { data: attendances, isLoading: loadingAttendances } = useAttendances();
  const { data: leaves, isLoading: loadingLeaves } = useLeaves();

  const isLoading = loadingEmployees || loadingDepartments || loadingAttendances || loadingLeaves;

  // Computed on every render (cheap) rather than once at module load, so
  // the dashboard rolls over to the next day on its own — no stale date
  // left over from when the tab was first opened.
  const TODAY = todayDateString();

  // Employee ids on an approved *Cuti* that covers today. Approved "Izin"
  // does NOT exempt an employee here — per the business rule, Izin days
  // simply fall into "Tidak Hadir" since there's no attendance record.
  const employeesOnLeaveToday = useMemo(() => {
    const set = new Set<number>();
    (leaves ?? []).forEach((l) => {
      if (
        l.jenis === "Cuti" &&
        l.status.toLowerCase() === "approved" &&
        l.tanggal_mulai.slice(0, 10) <= TODAY &&
        l.tanggal_selesai.slice(0, 10) >= TODAY
      ) {
        set.add(l.employee_id);
      }
    });
    return set;
  }, [leaves, TODAY]);

  // Today's attendance record per employee (upsert means at most one per day).
  const todaysAttendanceByEmployee = useMemo(() => {
    const map = new Map<number, Attendance>();
    (attendances ?? [])
      .filter((a) => a.tanggal.slice(0, 10) === TODAY)
      .forEach((a) => map.set(a.employee_id, a));
    return map;
  }, [attendances, TODAY]);

  const pendingLeaveCount = useMemo(
    () => (leaves ?? []).filter((l) => l.status.toLowerCase() === "pending").length,
    [leaves]
  );

  const stats = useMemo(() => {
    const totalEmployees = employees?.length ?? 0;
    const presentToday = (employees ?? []).filter((e) => {
      const rec = todaysAttendanceByEmployee.get(e.id);
      return rec && classifyAttendanceStatus(resolveAttendanceStatus(rec)) !== "absent";
    }).length;
    return {
      totalEmployees,
      presentToday,
      totalDepartments: departments?.length ?? 0,
    };
  }, [employees, departments, todaysAttendanceByEmployee]);

  // Attendance Overview: every employee bucketed into exactly one status for
  // today, so the donut total always equals total headcount.
  const attendanceOverview = useMemo(() => {
    let present = 0;
    let late = 0;
    let cuti = 0;
    let tidakHadir = 0;

    (employees ?? []).forEach((e) => {
      if (employeesOnLeaveToday.has(e.id)) {
        cuti += 1;
        return;
      }
      const rec = todaysAttendanceByEmployee.get(e.id);
      if (!rec) {
        tidakHadir += 1;
        return;
      }
      const bucket = classifyAttendanceStatus(resolveAttendanceStatus(rec));
      if (bucket === "present") present += 1;
      else if (bucket === "late") late += 1;
      else tidakHadir += 1;
    });

    return [
      { name: "Tepat Waktu", value: present, fill: COLORS.present },
      { name: "Terlambat", value: late, fill: COLORS.late },
      { name: "Tidak Hadir", value: tidakHadir, fill: COLORS.absent },
      { name: "Cuti", value: cuti, fill: COLORS.cuti },
    ];
  }, [employees, employeesOnLeaveToday, todaysAttendanceByEmployee]);

  const employeeDistribution = useMemo(() => {
    if (!employees || !departments) return [];
    return departments
      .map((d) => ({
        name: d.nama_departemen,
        value: employees.filter((e) => e.department_id === d.id).length,
      }))
      .filter((d) => d.value > 0);
  }, [employees, departments]);

  // Kehadiran per Departemen: how many employees from each department have
  // checked in today (present or late).
  const attendanceByDepartment = useMemo(() => {
    if (!employees || !departments) return [];
    const rows = departments.map((d, i) => {
      const deptEmployees = employees.filter((e) => e.department_id === d.id);
      const count = deptEmployees.filter((e) => {
        const rec = todaysAttendanceByEmployee.get(e.id);
        return rec && classifyAttendanceStatus(resolveAttendanceStatus(rec)) !== "absent";
      }).length;
      return { name: d.nama_departemen, count, color: COLORS.dept[i % COLORS.dept.length] };
    });
    const maxCount = Math.max(1, ...rows.map((r) => r.count));
    return rows.map((r) => ({ ...r, pct: Math.round((r.count / maxCount) * 100) }));
  }, [employees, departments, todaysAttendanceByEmployee]);

  // Recent Activity intentionally shows only attendance clock events — leave
  // submissions have no time component in the backend (only dates), so
  // mixing them in would mean showing a date where every other row shows a
  // real clock time. Keeping it to clock in/out keeps every row genuinely
  // time-stamped, like Attendance.
  const recentActivity = useMemo(() => {
    type Item = { id: string; name: string; subtitle: string; time: string; sortKey: string };
    const items: Item[] = [];

    (attendances ?? []).forEach((a) => {
      const name = a.employees?.nama_lengkap ?? "Karyawan";
      if (a.clock_in) {
        items.push({
          id: `in-${a.id}`,
          name,
          subtitle: "Clock in",
          time: formatClockTimeWithSeconds(a.clock_in),
          sortKey: `${a.tanggal.slice(0, 10)}T${new Date(a.clock_in).toISOString().slice(11, 19)}`,
        });
      }
      if (a.clock_out) {
        items.push({
          id: `out-${a.id}`,
          name,
          subtitle: "Clock out",
          time: formatClockTimeWithSeconds(a.clock_out),
          sortKey: `${a.tanggal.slice(0, 10)}T${new Date(a.clock_out).toISOString().slice(11, 19)}`,
        });
      }
    });

    return items.sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1)).slice(0, 6);
  }, [attendances]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Ringkasan aktivitas hari ini." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-6 w-1/2" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Total Employees" value={stats.totalEmployees} icon={<Users className="h-5 w-5" />} accent="primary" description="Karyawan terdaftar" />
            <StatCard label="Present Today" value={stats.presentToday} icon={<CalendarCheck className="h-5 w-5" />} accent="success" description="Hadir hari ini" />
            <StatCard label="Departments" value={stats.totalDepartments} icon={<Building2 className="h-5 w-5" />} accent="info" description="Departemen aktif" />
            <StatCard label="Pending Leave" value={pendingLeaveCount} icon={<ClipboardList className="h-5 w-5" />} accent="warning" description="Menunggu tindakan" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Attendance Overview — donut with center headcount + legend */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Distribusi status kehadiran hari ini</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : stats.totalEmployees === 0 ? (
              <EmptyState title="Belum ada karyawan" description="Tambahkan karyawan untuk melihat distribusi kehadiran." />
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                <div className="relative h-44 w-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceOverview}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={82}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        {attendanceOverview.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: 10, border: "1px solid #DCEDE3", fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl font-bold text-text-primary">{stats.totalEmployees}</span>
                    <span className="text-[11px] text-text-secondary">Karyawan</span>
                  </div>
                </div>

                <div className="w-full space-y-2.5 sm:w-auto sm:min-w-[190px]">
                  {attendanceOverview.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
                      <span className="flex items-center gap-2 text-text-secondary">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                        {item.name}
                      </span>
                      <span className="font-semibold text-text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Employee Distribution</CardTitle>
              <CardDescription>Berdasarkan departemen</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : employeeDistribution.length === 0 ? (
              <EmptyState title="Belum ada data" description="Tambahkan karyawan dan departemen untuk melihat distribusi." />
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="h-44 w-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={employeeDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={82}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {employeeDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS.dept[i % COLORS.dept.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: 10, border: "1px solid #DCEDE3", fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom scrollable legend — recharts' built-in <Legend> gets
                    clipped instead of scrolling once there are many departments. */}
                <div className="w-full space-y-2 overflow-y-auto sm:max-h-44 sm:w-auto sm:min-w-[160px] sm:pr-1">
                  {employeeDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-text-secondary">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: COLORS.dept[i % COLORS.dept.length] }}
                        />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kehadiran per Departemen — colored dot + count + progress bar */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Attendance By Department</CardTitle>
              <CardDescription>Hari ini</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : attendanceByDepartment.length === 0 ? (
              <EmptyState title="Belum ada departemen" description="Tambahkan departemen untuk melihat kehadiran per departemen." />
            ) : (
              <div className="space-y-4">
                {attendanceByDepartment.map((row) => (
                  <div key={row.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-text-primary">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                        {row.name}
                      </span>
                      <span className="font-semibold text-text-primary">{row.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary-light/60">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity — avatar, name, action, right-aligned time */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Aktivitas absensi terbaru</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="!pt-2">
            {isLoading ? (
              <div className="space-y-4 pt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <EmptyState title="Belum ada aktivitas" description="Aktivitas akan muncul di sini." />
            ) : (
              <ul>
                {recentActivity.map((item, i) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3 py-3 ${i !== recentActivity.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <Avatar name={item.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">{item.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-xs text-text-secondary">{item.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
