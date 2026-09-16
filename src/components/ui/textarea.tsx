import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[88px] w-full rounded-[var(--radius-control)] border bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/70 transition-colors",
          "border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-60",
          hasError && "border-danger focus-visible:ring-danger/30 focus-visible:border-danger",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
