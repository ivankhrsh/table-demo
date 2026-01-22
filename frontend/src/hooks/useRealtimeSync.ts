import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Row } from '@/types'
import type { ConnectionStatus } from '@/lib/api'
import { createRealtimeSubscription } from '@/lib/api'

export function useRealtimeSync() {
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const unsubscribe = createRealtimeSubscription(
      (updatedRow: Row) => {
        queryClient.setQueryData(['rows'], (old: any) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              rows: page.rows.map((row: Row) =>
                row.id === updatedRow.id ? updatedRow : row,
              ),
            })),
          }
        })
      },
      (err) => {
        console.error('Realtime error:', err)
      },
      {
        onConnectionChange: (status) => {
          setConnectionStatus(status)
          if (status === 'reconnecting') {
            setRetryCount((prev) => prev + 1)
          } else if (status === 'connected') {
            setRetryCount(0)
          }
        },
      },
    )

    return unsubscribe
  }, [queryClient])

  return {
    connectionStatus,
    retryCount,
  }
}
