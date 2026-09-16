import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[image:var(--gradient-primary)] text-sm font-semibold text-white shadow-sm",
        className
      )}
    >
      <AvatarPrimitive.Fallback>{getInitials(name)}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
