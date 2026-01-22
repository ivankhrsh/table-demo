import axios from 'axios'
import type { Row, RowsResponse } from '@/types'
import { ApiError } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to check network status before making requests
apiClient.interceptors.request.use(
  (config) => {
    // Check if network is offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return Promise.reject(
        new Error('Network is offline. Please check your connection and try again.'),
      )
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to network being offline
    if (
      (typeof navigator !== 'undefined' && !navigator.onLine) ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error'
    ) {
      throw new Error('Network is offline. Please check your connection and try again.')
    }
    throw ApiError.fromAxiosError(error)
  },
)

export async function fetchRows(
  page: number = 0,
  pageSize: number = 100,
): Promise<RowsResponse> {
  const { data } = await apiClient.get<RowsResponse>('/rows', {
    params: { page, pageSize },
  })
  return data
}

export async function updateRow(
  id: number,
  updates: Record<string, string | number | null>,
): Promise<Row> {
  const { data } = await apiClient.patch<Row>(`/rows/${id}`, { updates })
  return data
}

function isValidRow(data: unknown): data is Row {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as { id: unknown }).id === 'number'
  )
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

interface RealtimeSubscriptionOptions {
  maxRetries?: number
  initialRetryDelay?: number
  maxRetryDelay?: number
  retryBackoffMultiplier?: number
  onConnectionChange?: (status: ConnectionStatus) => void
}

const DEFAULT_OPTIONS: Required<
  Omit<RealtimeSubscriptionOptions, 'onConnectionChange'>
> & {
  onConnectionChange?: RealtimeSubscriptionOptions['onConnectionChange']
} = {
  maxRetries: Infinity,
  initialRetryDelay: 1000,
  maxRetryDelay: 30000,
  retryBackoffMultiplier: 2,
  onConnectionChange: undefined,
}

export function createRealtimeSubscription(
  onUpdate: (row: Row) => void,
  onError?: (error: Error) => void,
  options: RealtimeSubscriptionOptions = {},
): () => void {
  const opts: Required<Omit<RealtimeSubscriptionOptions, 'onConnectionChange'>> & {
    onConnectionChange?: RealtimeSubscriptionOptions['onConnectionChange']
  } = { ...DEFAULT_OPTIONS, ...options }
  let eventSource: EventSource | null = null
  let retryCount = 0
  let retryDelay = opts.initialRetryDelay
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  let connectionCheckIntervalId: ReturnType<typeof setInterval> | null = null
  let isClosed = false
  let isNetworkOffline = false
  let currentStatus: ConnectionStatus = 'disconnected'

  function updateStatus(status: ConnectionStatus) {
    if (currentStatus !== status) {
      currentStatus = status
      opts.onConnectionChange?.(status)
    }
  }

  function connect() {
    if (isClosed) return

    // Update status to reconnecting if not first connection
    if (currentStatus !== 'disconnected') {
      updateStatus('reconnecting')
    }

    try {
      eventSource = new EventSource(`${API_BASE_URL}/rows/realtime`)

      eventSource.onopen = () => {
        // Reset retry delay on successful connection
        retryCount = 0
        retryDelay = opts.initialRetryDelay
        updateStatus('connected')
        // Clear any pending reconnect timeout since we're connected
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout)
          reconnectTimeout = null
        }
      }

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as unknown

          // Ignore ping messages
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'type' in parsed
          ) {
            const msg = parsed as { type: string }
            if (msg.type === 'ping' || msg.type === 'connected') {
              return
            }
          }

          if (isValidRow(parsed)) {
            onUpdate(parsed)
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to parse update'
          onError?.(new Error(errorMessage))
        }
      }

      eventSource.onerror = () => {
        const currentEventSource = eventSource
        if (!currentEventSource) return
        
        const readyState = currentEventSource.readyState

        if (readyState === EventSource.CLOSED) {
          // Connection closed, attempt to reconnect
          currentEventSource.close()
          eventSource = null
          updateStatus('disconnected')

          if (!isClosed && retryCount < opts.maxRetries) {
            retryCount++
            reconnectTimeout = setTimeout(() => {
              connect()
              // Exponential backoff with max limit
              retryDelay = Math.min(
                retryDelay * opts.retryBackoffMultiplier,
                opts.maxRetryDelay,
              )
            }, retryDelay)
          } else if (retryCount >= opts.maxRetries) {
            updateStatus('disconnected')
            onError?.(new Error('Max retry attempts reached'))
          }
        } else if (readyState === EventSource.CONNECTING) {
          // EventSource is attempting to reconnect automatically
          // Update status but let EventSource handle reconnection
          updateStatus('reconnecting')
        } else if (readyState === EventSource.OPEN) {
          // Connection appears open but error occurred (network issue)
          // EventSource will automatically try to reconnect, but we should
          // also set status to reconnecting to reflect potential network issues
          updateStatus('reconnecting')
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create EventSource'
      onError?.(new Error(errorMessage))

      // Retry connection if within retry limit (isClosed check happens in connect())
      if (retryCount < opts.maxRetries) {
        retryCount++
        reconnectTimeout = setTimeout(() => {
          connect()
          retryDelay = Math.min(
            retryDelay * opts.retryBackoffMultiplier,
            opts.maxRetryDelay,
          )
        }, retryDelay)
      }
    }
  }

  // Handle online/offline events for better network detection
  const handleOnline = () => {
    // Network came back online
    isNetworkOffline = false
    
    // Attempt immediate reconnection if not closed
    if (!isClosed) {
      // If EventSource is closed or doesn't exist, reconnect immediately
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        retryCount = 0
        retryDelay = opts.initialRetryDelay
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }
        connect()
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        // EventSource is already trying to reconnect, just update status
        updateStatus('reconnecting')
      }
      // If OPEN, status should already be 'connected' from onopen handler
    }
  }

  const handleOffline = () => {
    // Network went offline
    isNetworkOffline = true
    updateStatus('disconnected')
    
    // Close EventSource to prevent it from trying to reconnect
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    
    // Clear any pending reconnect timeouts
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
  }

  // Check connection state periodically to catch automatic reconnections
  // This handles cases where EventSource reconnects but onopen doesn't fire
  const checkConnection = () => {
    if (isClosed || isNetworkOffline) return // Don't check if network is offline
    
    if (eventSource && eventSource.readyState === EventSource.OPEN) {
      // Connection is open, ensure status is connected
      if (currentStatus !== 'connected') {
        updateStatus('connected')
        retryCount = 0
        retryDelay = opts.initialRetryDelay
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout)
          reconnectTimeout = null
        }
      }
    }
  }

  // Start initial connection
  connect()

  // Listen to browser online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  // Set up periodic connection check to catch automatic reconnections
  connectionCheckIntervalId = setInterval(checkConnection, 1000) // Check every second

  // Return cleanup function
  return () => {
    isClosed = true
    updateStatus('disconnected')
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
    if (connectionCheckIntervalId) {
      clearInterval(connectionCheckIntervalId)
      connectionCheckIntervalId = null
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }
}
