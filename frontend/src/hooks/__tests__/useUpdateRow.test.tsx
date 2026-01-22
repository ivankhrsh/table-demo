import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateRow } from '../useUpdateRow';
import * as api from '../../lib/api';

vi.mock('../../lib/api');

describe('useUpdateRow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('updates row successfully', async () => {
    const updatedRow = { id: 1, col_text_1: 'updated' };
    vi.mocked(api.updateRow).mockResolvedValue(updatedRow);

    // Set up initial query data
    queryClient.setQueryData(['rows'], {
      pages: [
        {
          rows: [{ id: 1, col_text_1: 'original' }],
          total: 1,
          page: 0,
          pageSize: 1000,
        },
      ],
      pageParams: [0],
    });

    const { result } = renderHook(() => useUpdateRow(), { wrapper });

    result.current.mutate({
      id: 1,
      updates: { col_text_1: 'updated' },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.updateRow).toHaveBeenCalledWith(1, { col_text_1: 'updated' });
  });

  it('handles update error', async () => {
    const error = new Error('Update failed');
    vi.mocked(api.updateRow).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateRow(), { wrapper });

    result.current.mutate({
      id: 1,
      updates: { col_text_1: 'updated' },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
