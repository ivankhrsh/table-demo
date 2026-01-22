import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRowsQuery } from '../useRowsQuery';
import { fetchRows } from '../../lib/api';

vi.mock('../../lib/api');

describe('useRowsQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches rows on mount', async () => {
    const mockData = {
      rows: [{ id: 1, col_text_1: 'test' }],
      total: 1,
      page: 0,
      pageSize: 100,
    };

    vi.mocked(fetchRows).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRowsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchRows).toHaveBeenCalledWith(0, 100);
    expect(result.current.data?.pages[0]).toEqual(mockData);
  });

  it('handles fetch error', async () => {
    const error = new Error('Fetch failed');
    vi.mocked(fetchRows).mockRejectedValue(error);

    const { result } = renderHook(() => useRowsQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
