import { useCallback, useEffect, useReducer } from 'react'

type CellPosition = {
  rowId: number
  columnId: string
}

type CellState =
  | { type: 'idle' }
  | { type: 'selected'; position: CellPosition }
  | { type: 'editing'; position: CellPosition }

type CellAction =
  | { type: 'SELECT'; position: CellPosition }
  | { type: 'START_EDIT'; position: CellPosition }
  | { type: 'CANCEL_EDIT' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'CLEAR_ALL' }

function cellStateReducer(state: CellState, action: CellAction): CellState {
  switch (action.type) {
    case 'SELECT':
      // Don't select if already editing
      if (state.type === 'editing') return state
      return { type: 'selected', position: action.position }
    case 'START_EDIT':
      // Clear selection when entering edit mode
      return { type: 'editing', position: action.position }
    case 'CANCEL_EDIT':
      return state.type === 'editing' ? { type: 'idle' } : state
    case 'CLEAR_SELECTION':
      return state.type === 'selected' ? { type: 'idle' } : state
    case 'CLEAR_ALL':
      return { type: 'idle' }
    default:
      return state
  }
}

interface UseCellStateOptions {
  onEditCancel?: () => void
}

/**
 * Custom hook for managing cell selection and editing state
 * Uses a reducer pattern for predictable state transitions
 */
export function useCellState(options?: UseCellStateOptions) {
  const [state, dispatch] = useReducer(cellStateReducer, { type: 'idle' })

  const selectCell = useCallback((rowId: number, columnId: string) => {
    dispatch({ type: 'SELECT', position: { rowId, columnId } })
  }, [])

  const startEdit = useCallback((rowId: number, columnId: string) => {
    dispatch({ type: 'START_EDIT', position: { rowId, columnId } })
  }, [])

  const cancelEdit = useCallback(() => {
    dispatch({ type: 'CANCEL_EDIT' })
    options?.onEditCancel?.()
  }, [options])

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' })
  }, [])

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  // Handle click outside to clear selection
  useEffect(() => {
    if (state.type !== 'selected') return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Don't clear if clicking on a cell (handled by cell click handlers)
      const isClickOnCell = target.closest('td')
      // Don't clear if clicking on Select dropdown
      const isClickInSelect =
        target.closest('[data-slot="select-content"]') ||
        target.closest('[data-slot="select-item"]') ||
        target.closest('[data-slot="select-trigger"]')
      // Don't clear if clicking on cell editor
      const isClickInEditor = target.closest('[data-cell-editor]')

      if (!isClickOnCell && !isClickInSelect && !isClickInEditor) {
        clearSelection()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [state, clearSelection])

  // Handle click outside to cancel editing
  useEffect(() => {
    if (state.type !== 'editing') return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Check if click is outside any cell editor
      const isClickInEditor = target.closest('[data-cell-editor]')
      // Check if click is inside Select dropdown (which is rendered in a Portal)
      const isClickInSelect =
        target.closest('[data-slot="select-content"]') ||
        target.closest('[data-slot="select-item"]') ||
        target.closest('[data-slot="select-trigger"]')
      if (!isClickInEditor && !isClickInSelect) {
        cancelEdit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [state, cancelEdit])

  // Derived values for backward compatibility
  const editingCell: CellPosition | null =
    state.type === 'editing' ? state.position : null
  const selectedCell: CellPosition | null =
    state.type === 'selected' ? state.position : null

  return {
    state,
    editingCell,
    selectedCell,
    selectCell,
    startEdit,
    cancelEdit,
    clearSelection,
    clearAll,
  }
}
