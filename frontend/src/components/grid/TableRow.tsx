import React from 'react'
import { TableCell } from './TableCell'
import type { Row as TableRow } from '@tanstack/react-table'
import type { ColumnMeta, Row } from '@/types'
import { TableRow as ShadcnTableRow } from '@/components/ui/table'

interface TableRowProps {
  row: TableRow<Row>
  editingCell: { rowId: number; columnId: string } | null
  selectedCell: { rowId: number; columnId: string } | null
  onStartEdit: (rowId: number, columnId: string) => void
  onCellClick: (rowId: number, columnId: string) => void
  onSave: (
    rowId: number,
    columnId: string,
    value: string | number | null,
  ) => void
  onCancel: () => void
}

function TableRowComponent({
  row,
  editingCell,
  selectedCell,
  onStartEdit,
  onCellClick,
  onSave,
  onCancel,
}: TableRowProps) {
  const rowId = row.original.id

  return (
    <ShadcnTableRow key={rowId} data-index={row.index}>
      {row.getVisibleCells().map((cell) => {
        const isEditing =
          editingCell !== null &&
          editingCell.rowId === rowId &&
          editingCell.columnId === cell.column.id
        const isSelected =
          selectedCell !== null &&
          selectedCell.rowId === rowId &&
          selectedCell.columnId === cell.column.id
        const meta = cell.column.columnDef.meta as ColumnMeta | undefined
        const isReadonly = meta?.readonly === true

        return (
          <TableCell
            key={cell.id}
            cell={cell}
            isEditing={isEditing}
            isSelected={isSelected}
            isReadonly={isReadonly}
            meta={meta}
            onStartEdit={() => onStartEdit(rowId, cell.column.id)}
            onCellClick={() => onCellClick(rowId, cell.column.id)}
            onSave={(value) => onSave(rowId, cell.column.id, value)}
            onCancel={onCancel}
          />
        )
      })}
    </ShadcnTableRow>
  )
}

// Memoize component to prevent unnecessary re-renders
export const TableRowComponentMemo = React.memo(
  TableRowComponent,
  (prevProps, nextProps) => {
    // Only re-render if row ID or editing/selection state changes
    const prevRowId = prevProps.row.original.id
    const nextRowId = nextProps.row.original.id
    const prevIsEditing = prevProps.editingCell?.rowId === prevRowId
    const nextIsEditing = nextProps.editingCell?.rowId === nextRowId
    const prevIsSelected = prevProps.selectedCell?.rowId === prevRowId
    const nextIsSelected = nextProps.selectedCell?.rowId === nextRowId

    // Re-render if row ID changed
    if (prevRowId !== nextRowId) return false

    // Re-render if row index changed (sorting/filtering)
    if (prevProps.row.index !== nextProps.row.index) return false

    // Re-render if editing state changed for this row
    if (prevIsEditing !== nextIsEditing) return false

    // Re-render if selection state changed for this row
    if (prevIsSelected !== nextIsSelected) return false

    // Re-render if editing cell changed for this row
    if (
      prevIsEditing &&
      nextIsEditing &&
      prevProps.editingCell.columnId !== nextProps.editingCell.columnId
    ) {
      return false
    }

    // Re-render if selected cell changed for this row
    if (
      prevIsSelected &&
      nextIsSelected &&
      prevProps.selectedCell.columnId !== nextProps.selectedCell.columnId
    ) {
      return false
    }

    // Check if cell values changed
    const prevCells = prevProps.row.getVisibleCells()
    const nextCells = nextProps.row.getVisibleCells()
    if (prevCells.length !== nextCells.length) return false

    for (let i = 0; i < prevCells.length; i++) {
      if (prevCells[i].getValue() !== nextCells[i].getValue()) {
        return false
      }
    }

    // Skip re-render if nothing changed
    return true
  },
)

// Export with original name for backward compatibility
export { TableRowComponentMemo as TableRowComponent }
