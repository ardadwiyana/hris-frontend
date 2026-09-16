import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Data tidak dapat dimuat. Silakan coba lagi.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-light text-danger">
        <AlertCircle className="h-5.5 w-5.5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary max-w-sm">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-1">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
