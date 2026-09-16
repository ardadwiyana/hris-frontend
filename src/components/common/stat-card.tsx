import { type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "primary" | "success" | "warning" | "info" | "danger";

const ACCENT_STYLES: Record<
  Accent,
  { iconBg: string; blob: string; iconText: string }
> = {
  primary: {
    iconBg: "bg-[image:var(--gradient-primary)]",
    iconText: "text-white",
    blob: "bg-primary/25",
  },
  success: {
    iconBg: "bg-success",
    iconText: "text-white",
    blob: "bg-success/20",
  },
  warning: {
    iconBg: "bg-warning",
    iconText: "text-white",
    blob: "bg-warning/20",
  },
  info: {
    iconBg: "bg-info",
    iconText: "text-white",
    blob: "bg-info/20",
  },
  danger: {
    iconBg: "bg-danger",
    iconText: "text-white",
    blob: "bg-danger/20",
  }
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: Accent;
  change?: { value: number; period: string };
  description?: string;
}

export function StatCard({ label, value, icon, accent = "primary", change, description }: StatCardProps) {
  const styles = ACCENT_STYLES[accent];
  const isPositive = (change?.value ?? 0) >= 0;

  return (
    <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Decorative glow blob, drifts subtly further out on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125",
          styles.blob
        )}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="font-display mt-2 text-[1.75rem] font-bold leading-none tracking-tight text-text-primary">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md",
            styles.iconBg,
            styles.iconText
          )}
        >
          {icon}
        </span>
      </div>

      {(change || description) && (
        <div className="relative mt-3.5 flex items-center gap-1.5 text-xs">
          {change && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                isPositive ? "bg-success-light text-success" : "bg-danger-light text-danger"
              )}
            >
              {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {isPositive ? "+" : ""}
              {change.value}%
            </span>
          )}
          <span className="text-text-secondary">{change ? change.period : description}</span>
        </div>
      )}
    </Card>
  );
}
