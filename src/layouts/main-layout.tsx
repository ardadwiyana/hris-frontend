import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useLeaveStatusReconciliation } from "@/features/employee/hooks/use-leave-status-reconciliation";

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keeps employee status in sync once an approved Cuti period ends —
  // runs quietly across every authenticated page.
  useLeaveStatusReconciliation();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main
          className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
          style={{ backgroundImage: "var(--gradient-mesh)", backgroundAttachment: "fixed" }}
        >
          <div className="relative mx-auto max-w-[1400px] animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
