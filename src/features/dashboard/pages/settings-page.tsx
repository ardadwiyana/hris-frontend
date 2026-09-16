import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCurrentEmployee } from "@/features/employee/hooks/use-employees";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  employee: "Employee",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { employee } = useCurrentEmployee();

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Informasi akun Anda saat ini." />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Profil Akun</CardTitle>
            <CardDescription>
              Silahkan hubungi administrator jika Anda ingin mengubah informasi akun.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar name={employee?.nama_lengkap ?? user?.username ?? "?"} className="h-14 w-14 text-base" />
            <div>
              <p className="text-base font-semibold text-text-primary">
                {employee?.nama_lengkap ?? user?.username}
              </p>
              <p className="text-sm text-text-secondary">{user?.username}</p>
              <Badge tone="primary" className="mt-1.5">
                {user ? ROLE_LABEL[user.role] ?? user.role : ""}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
