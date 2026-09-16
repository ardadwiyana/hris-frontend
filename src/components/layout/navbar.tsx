import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, Settings, ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "@/constants/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCurrentEmployee } from "@/features/employee/hooks/use-employees";
import { Avatar } from "@/components/ui/avatar";
import { SearchInput } from "@/components/form/search-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  employee: "Employee",
};

export function Navbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { employee } = useCurrentEmployee();
  const [search, setSearch] = useState("");

  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
  const displayName = employee?.nama_lengkap ?? user?.username ?? "";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 shadow-sm backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="rounded-md p-1.5 text-text-secondary hover:bg-primary-light lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="hidden items-center gap-1.5 text-xs text-text-secondary sm:flex">
          <span>HRIS</span>
          {currentNav && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-text-primary">{currentNav.label}</span>
            </>
          )}
        </div>
        <h2 className="truncate text-base font-semibold text-text-primary sm:hidden">
          {currentNav?.label ?? "HRIS"}
        </h2>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative rounded-full p-2 text-text-secondary hover:bg-primary-light hover:text-primary-dark"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
          <div className="px-2.5 py-6 text-center text-xs text-text-secondary">
            Belum ada notifikasi
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-full pl-0.5 pr-2 py-0.5 hover:bg-primary-light"
            aria-label="Menu profil"
          >
            <Avatar name={displayName || "?"} />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium text-text-primary">{displayName}</span>
              <span className="block text-xs text-text-secondary">
                {user ? ROLE_LABEL[user.role] ?? user.role : ""}
              </span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => navigate("/settings")}>
            <Settings className="h-4 w-4" />
            Pengaturan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem danger onSelect={logout}>
            <LogOut className="h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
