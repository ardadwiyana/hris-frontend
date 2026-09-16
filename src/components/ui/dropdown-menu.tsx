import { type ReactNode } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  children,
  align = "end",
}: {
  children: ReactNode;
  align?: "start" | "end" | "center";
}) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={8}
        className="z-50 min-w-[200px] rounded-[var(--radius-control)] border border-border bg-card p-1.5 shadow-lg animate-slide-up"
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  className,
  danger,
}: {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
  danger?: boolean;
}) {
  return (
    <DropdownPrimitive.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-text-primary outline-none transition-colors",
        "hover:bg-primary-light focus:bg-primary-light",
        danger && "text-danger hover:bg-danger-light focus:bg-danger-light",
        className
      )}
    >
      {children}
    </DropdownPrimitive.Item>
  );
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2.5 py-1.5 text-xs font-medium text-text-secondary">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="my-1.5 h-px bg-border" />;
}
