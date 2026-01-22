import { useCallback, useEffect, useMemo, useRef } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TableHeader } from './TableHeader'
import { TableRowComponent } from './TableRow'
import { TableFooter } from './TableFooter'
import { SkeletonLoader } from './SkeletonLoader'
import type { DataGridProps } from '@/types'
import { useRowsQuery } from '@/hooks/useRowsQuery'
import { useUpdateRow } from '@/hooks/useUpdateRow'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { useErrorToast } from '@/hooks/useErrorToast'
import { useCellState } from '@/hooks/useCellState'
import { TableBody } from '@/components/ui/table'

export function DataGrid({ columns }: DataGridProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { editingCell, selectedCell, selectCell, startEdit, cancelEdit } =
    useCellState()

  const {
    data: queryData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRowsQuery()
  const updateRowMutation = useUpdateRow()
  const { showError } = useErrorToast()
  const { connectionStatus } = useRealtimeSync()

  const data = useMemo(() => {
    return queryData?.pages.flatMap((page) => page.rows) ?? []
  }, [queryData])
  const total = queryData?.pages[0]?.total ?? 0

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  })

  const { rows } = table.getRowModel()

  // Memoize header groups to prevent TableHeader re-renders during scrolling
  // Only recompute when columns change, not when data changes
  const headerGroups = useMemo(() => table.getHeaderGroups(), [table, columns])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 5, // Reduced from 10 to 5 for better performance
    // Use native measurement in Chrome/Safari for accuracy
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element.getBoundingClientRect().height
        : undefined,
    // Account for fixed headers in scroll calculations
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  useEffect(() => {
    if (virtualRows.length === 0) return
    const lastItem = virtualRows[virtualRows.length - 1]
    const shouldLoadMore =
      lastItem.index >= rows.length - 1 - 10 &&
      hasNextPage &&
      !isFetchingNextPage
    if (shouldLoadMore) {
      fetchNextPage()
    }
  }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleCellUpdate = useCallback(
    (rowId: number, columnId: string, value: string | number | null) => {
      // Check if network is offline before attempting update
      // Only block if both navigator.onLine is false AND connection is disconnected
      // This allows updates when network is back even if SSE hasn't reconnected yet
      const isOffline =
        typeof navigator !== 'undefined' &&
        !navigator.onLine &&
        connectionStatus === 'disconnected'

      if (isOffline) {
        showError(
          new Error(
            'Network is offline. Please check your connection and try again.',
          ),
          {
            title: 'Cannot update cell',
            retry: () => {
              // Always attempt retry - let the mutation handle errors
              // This ensures we check current network state, not closure value
              handleCellUpdate(rowId, columnId, value)
            },
            retryLabel: 'Retry',
          },
        )
        // Keep editing cell open so user can retry when network is back
        return
      }

      updateRowMutation.mutate(
        { id: rowId, updates: { [columnId]: value } },
        {
          onSuccess: () => {
            cancelEdit()
          },
          onError: (err) => {
            showError(err, {
              title: 'Failed to update cell',
              retry: () => {
                handleCellUpdate(rowId, columnId, value)
              },
              retryLabel: 'Retry',
            })
            // Keep editing cell open on error so user can retry
          },
        },
      )
    },
    [updateRowMutation, showError, cancelEdit, connectionStatus],
  )

  const handleStartEdit = useCallback(
    (rowId: number, columnId: string) => {
      startEdit(rowId, columnId)
    },
    [startEdit],
  )

  const handleCancelEdit = useCallback(() => {
    cancelEdit()
  }, [cancelEdit])

  const handleCellClick = useCallback(
    (rowId: number, columnId: string) => {
      // Don't select if clicking on a readonly cell
      const column = columns.find((col) => col.id === columnId)
      const meta = column?.meta as { readonly?: boolean } | undefined
      if (meta?.readonly) return

      // Don't select if already editing
      if (editingCell) return

      selectCell(rowId, columnId)
    },
    [columns, editingCell, selectCell],
  )

  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? totalSize)
      : 0

  if (isLoading && data.length === 0) {
    return (
      <div className="flex flex-col h-full w-full">
        <div
          className="flex-1 overflow-auto overscroll-none custom-scrollbar scrollbar-thin"
          ref={tableContainerRef}
        >
          <table className="border-separate border-spacing-0 min-w-full w-max">
            <TableHeader headerGroups={headerGroups} />
            <SkeletonLoader columns={columns.length} />
          </table>
        </div>
        <TableFooter
          loadedCount={0}
          totalCount={0}
          isFetchingNextPage={false}
          hasNextPage={false}
        />
      </div>
    )
  }

  if (error && data.length === 0) {
    return (
      <div className="p-4 text-red-500">
        Error: {error instanceof Error ? error.message : 'Failed to load data'}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full">
      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-sm border-b shrink-0">
          {error instanceof Error ? error.message : 'An error occurred'}
        </div>
      )}
      <div
        className="flex-1 overflow-auto overscroll-none custom-scrollbar scrollbar-thin"
        ref={tableContainerRef}
      >
        <table className="border-separate border-spacing-0 min-w-full w-max">
          <TableHeader headerGroups={headerGroups} />
          <TableBody className="pt-10">
            {paddingTop > 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ height: `${paddingTop}px` }}
                />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <TableRowComponent
                  key={row.original.id}
                  row={row}
                  editingCell={editingCell}
                  selectedCell={selectedCell}
                  onStartEdit={handleStartEdit}
                  onCellClick={handleCellClick}
                  onSave={handleCellUpdate}
                  onCancel={handleCancelEdit}
                />
              )
            })}
            {paddingBottom > 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ height: `${paddingBottom}px` }}
                />
              </tr>
            )}
          </TableBody>
        </table>
      </div>
      <TableFooter
        loadedCount={data.length}
        totalCount={total}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage || false}
      />
    </div>
  )
}
