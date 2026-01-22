import React from 'react'
import { Loader2 } from 'lucide-react'

interface TableFooterProps {
  loadedCount: number
  totalCount: number
  isFetchingNextPage: boolean
  hasNextPage: boolean
}

function TableFooter({
  loadedCount,
  totalCount,
  isFetchingNextPage,
  hasNextPage,
}: TableFooterProps) {
  return (
    <div className="p-2 border-t flex items-center justify-between text-sm">
      <div>
        Loaded {loadedCount} of {totalCount} rows
      </div>
      {isFetchingNextPage && hasNextPage && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading more...</span>
        </div>
      )}
    </div>
  )
}

// Memoize footer to prevent re-renders during scrolling
export const TableFooterMemo = React.memo(TableFooter)

// Export with original name for backward compatibility
export { TableFooterMemo as TableFooter }
