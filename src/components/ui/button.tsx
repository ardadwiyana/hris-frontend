import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  {
    variants: {
      variant: {
        primary:
          "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-glow)] hover:shadow-[0_0_0_1px_rgba(233,106,122,0.1),0_10px_28px_rgba(233,106,122,0.3)] hover:-translate-y-px active:translate-y-0",
        secondary:
          "bg-primary-light text-primary-dark hover:bg-accent",
        outline:
          "border border-border bg-card text-text-primary shadow-xs hover:bg-primary-light hover:border-accent",
        ghost: "text-text-secondary hover:bg-primary-light hover:text-primary-dark",
        danger: "bg-danger text-white shadow-sm hover:brightness-95",
        success: "bg-success text-white shadow-sm hover:brightness-95",
        outlineDanger:
          "border border-danger/30 bg-card text-danger shadow-xs hover:bg-danger-light hover:border-danger/50",
        link: "text-primary-dark underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-base",
        icon: "h-9 w-9 shrink-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
