import { Badge } from "@/components/ui/badge";

// Central place mapping every status string used across the app to a tone
// and display label, so colors stay consistent between pages.
const STATUS_MAP: Record<string, { label: string; tone: "success" | "warning" | "danger" | "info" | "gray" | "primary" }> = {
  // Employee employment status
  active: { label: "Active", tone: "success" },
  aktif: { label: "Aktif", tone: "success" },
  inactive: { label: "Inactive", tone: "gray" },
  nonaktif: { label: "Nonaktif", tone: "gray" },
  "on leave": { label: "On Leave", tone: "warning" },
  cuti: { label: "Cuti", tone: "warning" },
  probation: { label: "Probation", tone: "primary" },
  probasi: { label: "Probasi", tone: "primary" },

  // Attendance (derived client-side, see utils/attendance.ts)
  present: { label: "Present", tone: "success" },
  hadir: { label: "Hadir", tone: "success" },
  late: { label: "Late", tone: "warning" },
  terlambat: { label: "Terlambat", tone: "warning" },
  absent: { label: "Absent", tone: "danger" },
  alpha: { label: "Alpha", tone: "danger" },
  "tidak hadir": { label: "Tidak Hadir", tone: "danger" },

  // Leave request status
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  disetujui: { label: "Disetujui", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  ditolak: { label: "Ditolak", tone: "danger" },
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) {
    return <Badge tone="gray">—</Badge>;
  }
  const key = status.trim().toLowerCase();
  const entry = STATUS_MAP[key] ?? { label: status, tone: "gray" as const };
  return (
    <Badge tone={entry.tone} dot>
      {entry.label}
    </Badge>
  );
}
