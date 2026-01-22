import { createFileRoute } from '@tanstack/react-router'
import { DataGrid } from '@/components/grid/DataGrid'
import { AppHeader } from '@/components/AppHeader'
import { columns } from '@/lib/columns'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <AppHeader />
      <div className="flex-1 min-h-0">
        <DataGrid columns={columns} />
      </div>
    </div>
  )
}
