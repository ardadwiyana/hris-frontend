import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { loginSchema, type LoginFormValues } from "../types/login-schema";
import { LoginBackground } from "../components/login-background";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/form/form-field";
import { ApiError } from "@/api/axios";

export default function LoginPage() {
  const { login, isAuthenticated, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", rememberMe: true },
  });

  // Always land on the dashboard after login, regardless of which page the
  // person was on before being sent to /login.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login({ username: values.username, password: values.password }, values.rememberMe);
      toast.success("Login berhasil");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Login gagal, silakan coba lagi";
      setFormError(message);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      {/* Full-bleed decorative backdrop; the card in front carries the content */}
      <LoginBackground />

      <div className="relative w-full max-w-sm animate-scale-in rounded-[var(--radius-card)] border border-border bg-card p-8 shadow-xl sm:p-9">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] font-display text-sm font-bold text-white shadow-[var(--shadow-glow)]">
            HRIS
          </div>
          <span className="font-display text-base font-bold text-text-primary">LOGIN</span>
        </div>

        <p className="mt-1.5 text-center text-sm text-text-secondary">
          Masukkan email dan password untuk masuk.
          <br />"employee@hris.com" / "employeehris"<br />atau
          <br />"admin@hris.com" / "adminhris"
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          {formError && (
            <div className="animate-slide-up rounded-[var(--radius-control)] border border-danger/30 bg-danger-light px-3.5 py-2.5 text-sm text-danger">
              {formError}
            </div>
          )}

          <FormField label="Email" htmlFor="username" error={errors.username?.message} required>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="username"
                type="email"
                autoComplete="username"
                placeholder="nama@perusahaan.com"
                className="pl-9"
                hasError={Boolean(errors.username)}
                {...register("username")}
              />
            </div>
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9 pr-10"
                hasError={Boolean(errors.password)}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-dark"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <div className="flex items-center justify-between pt-1">
            <Label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2 font-normal">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus-visible:outline-2 focus-visible:outline-primary accent-[#0E6E5A]"
                {...register("rememberMe")}
              />
              Ingat saya
            </Label>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoggingIn}>
            Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}
