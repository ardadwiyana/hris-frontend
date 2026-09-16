import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/constants/auth";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: Role[]; // omit = visible to all authenticated roles
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", to: "/employees", icon: Users },
  { label: "Attendance", to: "/attendance", icon: CalendarCheck, roles: ["admin", "manager"] },
  { label: "Leave", to: "/leave", icon: CalendarDays },
  { label: "Departments & Positions", to: "/organization", icon: Building2, roles: ["admin", "manager"] },
  { label: "Settings", to: "/settings", icon: Settings },
];
