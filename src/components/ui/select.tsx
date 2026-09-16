import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

// A native <select> styled to match the design system. Using the native
// element (rather than a custom listbox) keeps keyboard/screen-reader
// behavior correct for free, which matters more here than visual novelty.
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-[var(--radius-control)] border bg-card px-3 pr-9 text-sm text-text-primary transition-colors",
            "border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-60",
            hasError && "border-danger focus-visible:ring-danger/30 focus-visible:border-danger",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = "Select";
