import type { Attendance } from "@/features/attendance/types";

/** Wall-clock time on/before which a check-in still counts as on time. */
const ON_TIME_CUTOFF_MINUTES = 9 * 60; // 09:00

/**
 * Today's date as "YYYY-MM-DD", built from local wall-clock date
 * components (not `toISOString`, which converts to UTC first). This app
 * treats attendance dates/times as naive local wall-clock values
 * throughout (see formatClockTime, nowAsBackendTime, etc.), so deriving
 * "today" via UTC would drift a day behind local midnight for any
 * timezone ahead of UTC (e.g. WIB, UTC+7) until the UTC day rolls over too.
 */
export function todayDateString(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function timeToMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/**
 * Estimates a status from clock_in alone. Used only as a fallback for
 * records created before the backend's `status` column existed (where
 * status may come back null/empty).
 */
export function estimateStatusFromClockIn(row: Pick<Attendance, "clock_in">): string {
  if (!row.clock_in) return "Tidak Hadir";
  return timeToMinutes(row.clock_in) <= ON_TIME_CUTOFF_MINUTES ? "Hadir" : "Terlambat";
}

/** The status to actually display/count: the backend's stored value, or a fallback estimate. */
export function resolveAttendanceStatus(row: Pick<Attendance, "status" | "clock_in">): string {
  if (row.status && row.status.trim()) return row.status.trim();
  return estimateStatusFromClockIn(row);
}

export type AttendanceStatusClass = "present" | "late" | "absent" | "unknown";

/** Buckets a (possibly free-form) status string for counting/summaries. */
export function classifyAttendanceStatus(status: string | null | undefined): AttendanceStatusClass {
  if (!status) return "unknown";
  const s = status.trim().toLowerCase();
  if (s.includes("tidak hadir") || s === "absent" || s === "alpha") return "absent";
  if (s.includes("terlambat") || s === "late") return "late";
  if (s.includes("hadir") || s === "present") return "present";
  return "unknown";
}

/** Computes the on-time/late status to send when clocking in right now. */
export function computeLiveClockInStatus(now: Date): "Hadir" | "Terlambat" {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes <= ON_TIME_CUTOFF_MINUTES ? "Hadir" : "Terlambat";
}

export function formatClockTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/** Same as formatClockTime but includes seconds, for activity feeds. */
export function formatClockTimeWithSeconds(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(
    d.getUTCSeconds()
  ).padStart(2, "0")}`;
}

export function formatWorkDuration(clockIn: string | null, clockOut: string | null): string {
  if (!clockIn || !clockOut) return "—";
  const start = timeToMinutes(clockIn);
  const end = timeToMinutes(clockOut);
  const diff = end - start;
  if (diff <= 0) return "—";
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}j ${minutes}m`;
}

/** Converts a "HH:mm" input value to the "HH:mm:00" string the backend expects. */
export function toBackendTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

/** Converts a backend ISO datetime back into an "HH:mm" value for <input type="time">. */
export function toTimeInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/** Builds an "HH:mm:ss" string from the current local wall-clock time. */
export function nowAsBackendTime(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
