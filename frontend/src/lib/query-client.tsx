import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/types';

function shouldRetry(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Don't retry on 4xx errors
    return error.status < 400 || error.status >= 500;
  }
  return true;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        if (!shouldRetry(error)) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        if (!shouldRetry(error)) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
