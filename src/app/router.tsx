import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/main-layout";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import LoginPage from "@/features/auth/pages/login-page";
import DashboardPage from "@/features/dashboard/pages/dashboard-page";
import SettingsPage from "@/features/dashboard/pages/settings-page";
import EmployeesPage from "@/features/employee/pages/employees-page";
import EmployeeDetailPage from "@/features/employee/pages/employee-detail-page";
import AttendancesPage from "@/features/attendance/pages/attendances-page";
import LeavesPage from "@/features/leave/pages/leaves-page";
import OrganizationPage from "@/features/department/pages/organization-page";
import UsersPage from "@/features/user/pages/users-page";
import NotFoundPage from "@/pages/not-found-page";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/employees", element: <EmployeesPage /> },
          { path: "/employees/:id", element: <EmployeeDetailPage /> },
          { path: "/leave", element: <LeavesPage /> },
          { path: "/settings", element: <SettingsPage /> },

          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [
              { path: "/attendance", element: <AttendancesPage /> },
              { path: "/organization", element: <OrganizationPage /> },
              { path: "/departments", element: <Navigate to="/organization" replace /> },
              { path: "/positions", element: <Navigate to="/organization" replace /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin"]} />,
            children: [{ path: "/users", element: <UsersPage /> }],
          },
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
