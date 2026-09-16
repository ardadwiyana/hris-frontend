import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-control)] border bg-card px-3 text-sm text-text-primary placeholder:text-text-secondary/70 transition-colors",
          "border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-primary-light/40",
          hasError && "border-danger focus-visible:ring-danger/30 focus-visible:border-danger",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
