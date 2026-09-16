import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "./query-client";
import { AuthProvider } from "@/features/auth/hooks/use-auth";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #DCEDE3",
              color: "#2A332D",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
