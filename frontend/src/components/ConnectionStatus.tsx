import type { ConnectionStatus } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  status: ConnectionStatus
  retryCount?: number
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; dotColor: string; badgeVariant: 'default' | 'secondary' | 'destructive' }
> = {
  connected: {
    label: 'Connected',
    dotColor: 'bg-green-500',
    badgeVariant: 'secondary',
  },
  reconnecting: {
    label: 'Reconnecting',
    dotColor: 'bg-yellow-500',
    badgeVariant: 'secondary',
  },
  disconnected: {
    label: 'Disconnected',
    dotColor: 'bg-red-500',
    badgeVariant: 'destructive',
  },
}

export function ConnectionStatus({
  status,
  retryCount = 0,
}: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status]
  const label =
    status === 'reconnecting' && retryCount > 0
      ? `${config.label} (${retryCount})`
      : config.label

  return (
    <Badge
      variant={config.badgeVariant}
      className="gap-2"
      title={`Realtime connection: ${label}`}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          config.dotColor,
          status === 'reconnecting' && 'animate-pulse',
        )}
      />
      <span>{label}</span>
    </Badge>
  )
}
