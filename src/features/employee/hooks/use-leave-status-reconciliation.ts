import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployees, employeeKeys } from "@/features/employee/hooks/use-employees";
import { useLeaves } from "@/features/leave/hooks/use-leaves";
import { employeeApi } from "@/features/employee/api/employee.api";
import { toEmployeePayload } from "@/features/employee/utils";
import { todayDateString } from "@/utils/attendance";

/**
 * "Cuti" approval automatically moves an employee to On Leave status (see
 * useUpdateLeaveStatus). Since there's no backend job to revert it once the
 * leave period ends, this hook does that reconciliation client-side: any
 * employee still marked "On Leave" whose approved Cuti no longer covers
 * today gets moved back to "Active". Mount this once near the app root so
 * it runs opportunistically whenever employee/leave data is loaded.
 */
export function useLeaveStatusReconciliation() {
  const { data: employees } = useEmployees();
  const { data: leaves } = useLeaves();
  const queryClient = useQueryClient();
  const inFlightRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!employees || !leaves) return;

    const todayStr = todayDateString();
    const activeCutiEmployeeIds = new Set(
      leaves
        .filter(
          (l) =>
            l.jenis === "Cuti" &&
            l.status === "Approved" &&
            l.tanggal_mulai.slice(0, 10) <= todayStr &&
            l.tanggal_selesai.slice(0, 10) >= todayStr
        )
        .map((l) => l.employee_id)
    );

    const staleEmployees = employees.filter(
      (e) => e.status === "On Leave" && !activeCutiEmployeeIds.has(e.id) && !inFlightRef.current.has(e.id)
    );

    if (staleEmployees.length === 0) return;

    staleEmployees.forEach((e) => inFlightRef.current.add(e.id));

    Promise.allSettled(
      staleEmployees.map((e) =>
        employeeApi.update(e.id, toEmployeePayload(e, { status: "Active" }))
      )
    ).then(() => {
      staleEmployees.forEach((e) => inFlightRef.current.delete(e.id));
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    });
  }, [employees, leaves, queryClient]);
}
