import { useInfiniteQuery } from '@tanstack/react-query';
import type { RowsResponse } from '@/types';
import { fetchRows } from '@/lib/api';

const PAGE_SIZE = 100;

export function useRowsQuery() {
  return useInfiniteQuery<RowsResponse>({
    queryKey: ['rows'],
    queryFn: ({ pageParam = 0 }) => fetchRows(pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, page) => sum + page.rows.length, 0);
      return totalLoaded < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
}
