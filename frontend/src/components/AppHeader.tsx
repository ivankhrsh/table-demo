import { ConnectionStatus } from '@/components/ConnectionStatus'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'

export function AppHeader() {
  const { connectionStatus, retryCount } = useRealtimeSync()

  return (
    <div className="p-4 shrink-0 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Airtable-style Grid</h1>
          <p className="text-sm text-muted-foreground">
            Double-click a cell to edit. Changes sync in realtime across tabs.
          </p>
        </div>
        <ConnectionStatus status={connectionStatus} retryCount={retryCount} />
      </div>
    </div>
  )
}
