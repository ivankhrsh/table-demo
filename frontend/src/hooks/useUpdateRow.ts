import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Row } from '@/types'
import { updateRow } from '@/lib/api'

export function useUpdateRow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number
      updates: Record<string, string | number | null>
    }) => updateRow(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['rows'] })
      const previousData = queryClient.getQueryData(['rows'])
      queryClient.setQueryData(['rows'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            rows: page.rows.map((row: Row) =>
              row.id === id ? { ...row, ...updates } : row,
            ),
          })),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['rows'], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rows'] })
    },
  })
}
