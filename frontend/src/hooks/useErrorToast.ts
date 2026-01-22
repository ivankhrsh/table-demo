import { toast } from 'sonner'
import { ApiError } from '@/types'

/**
 * Hook for displaying error toasts with consistent formatting
 * and optional retry functionality
 */
export function useErrorToast() {
  const showError = (
    error: unknown,
    options?: {
      title?: string
      retry?: () => void
      retryLabel?: string
    },
  ) => {
    const title = options?.title || 'Error'
    let message = 'An unexpected error occurred'

    if (error instanceof ApiError) {
      message = error.message || `HTTP ${error.status} error`
    } else if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    const toastId = toast.error(title, {
      description: message,
      duration: 5000,
      richColors: true,
      action: options?.retry
        ? {
            label: options.retryLabel || 'Retry',
            onClick: () => {
              options.retry?.()
              toast.dismiss(toastId)
            },
          }
        : undefined,
    })

    return toastId
  }

  return { showError }
}
