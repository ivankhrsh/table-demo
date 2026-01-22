import React from 'react'
import { flexRender } from '@tanstack/react-table'
import { CellEditor } from './CellEditor'
import type { Cell } from '@tanstack/react-table'
import type { ColumnMeta, Row } from '@/types'
import { cn } from '@/lib/utils'
import { TableCell as ShadcnTableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface TableCellProps {
  cell: Cell<Row, unknown>
  isEditing: boolean
  isSelected: boolean
  isReadonly: boolean
  meta: ColumnMeta | undefined
  onStartEdit: () => void
  onCellClick: () => void
  onSave: (value: string | number | null) => void
  onCancel: () => void
}

function TableCell({
  cell,
  isEditing,
  isSelected,
  isReadonly,
  meta,
  onStartEdit,
  onCellClick,
  onSave,
  onCancel,
}: TableCellProps) {
  const columnSize = cell.column.getSize()

  return (
    <ShadcnTableCell
      key={cell.id}
      className={cn(
        'border box-border border-b border-r-transparent border-t-transparent p-1 text-center last:border-r first:border-l cursor-default',
        {
          'bg-muted cursor-not-allowed': isReadonly,
          'border-primary border-t border-b': isEditing,
          'border-primary/50 border-t border-b': isSelected && !isEditing,
        },
      )}
      style={
        {
          '--column-width': `${columnSize}px`,
        } as React.CSSProperties & { '--column-width': string }
      }
      onClick={(e) => {
        e.stopPropagation()
        if (!isReadonly && !isEditing) {
          onCellClick()
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        if (!isReadonly) {
          onStartEdit()
        }
      }}
    >
      <div className="w-(--column-width) min-w-(--column-width) max-w-(--column-width)">
        {isEditing ? (
          <div
            data-cell-editor
            className="w-full min-w-0 max-w-full overflow-hidden h-8 flex items-center"
          >
            <CellEditor
              value={cell.getValue() as string | number | null}
              type={meta?.type ?? 'text'}
              options={meta?.options}
              onSave={onSave}
              onCancel={onCancel}
            />
          </div>
        ) : (
          <div className="min-h-[32px] h-8 flex items-center w-full min-w-0 max-w-full overflow-hidden">
            {meta?.type === 'select' && cell.getValue() ? (
              <Badge
                variant="secondary"
                className="w-full justify-start truncate"
              >
                {String(cell.getValue())}
              </Badge>
            ) : (
              <div className="w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            )}
          </div>
        )}
      </div>
    </ShadcnTableCell>
  )
}

// Memoize component to prevent unnecessary re-renders
export const TableCellMemo = React.memo(TableCell, (prevProps, nextProps) => {
  // Re-render if editing state changed
  if (prevProps.isEditing !== nextProps.isEditing) return false

  // Re-render if selection state changed
  if (prevProps.isSelected !== nextProps.isSelected) return false

  // Re-render if cell value changed
  if (prevProps.cell.getValue() !== nextProps.cell.getValue()) return false

  // Re-render if readonly state changed
  if (prevProps.isReadonly !== nextProps.isReadonly) return false

  // Re-render if meta changed
  if (prevProps.meta !== nextProps.meta) return false

  // Skip re-render if nothing changed
  return true
})

// Export with original name for backward compatibility
export { TableCellMemo as TableCell }
