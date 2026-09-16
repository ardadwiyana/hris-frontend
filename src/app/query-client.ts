import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry auth/permission or not-found errors — retrying won't help.
        if (error instanceof ApiError && error.status && [401, 403, 404].includes(error.status)) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
