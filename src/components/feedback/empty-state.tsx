import { type ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary-dark">
        {icon ?? <Inbox className="h-5.5 w-5.5" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && <p className="text-sm text-text-secondary max-w-sm">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
