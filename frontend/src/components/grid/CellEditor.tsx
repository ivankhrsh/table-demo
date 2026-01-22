import { useState } from 'react'
import type { CellEditorProps } from '@/types'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CellEditor({
  value,
  type,
  options,
  onSave,
  onCancel,
}: CellEditorProps) {
  const [localValue, setLocalValue] = useState<string>(String(value ?? ''))

  const handleSelectChange = (val: string | null) => {
    const valueStr = val ?? ''
    setLocalValue(valueStr)
    
    // Use double requestAnimationFrame to ensure Select component has fully finished
    // its update cycle and the browser has painted before we save
    // This prevents the editor from closing before the Select dropdown closes
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        onSave(val || null)
      })
    })
  }

  const handleSubmit = () => {
    if (type === 'number') {
      const num = parseFloat(localValue)
      onSave(isNaN(num) ? null : num)
    } else {
      onSave(localValue || null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (type === 'select' && options) {
    return (
      <Select
        value={localValue}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="h-8 w-full min-w-0 max-w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      type={type === 'number' ? 'number' : 'text'}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={handleKeyDown}
      autoFocus
      className="h-8 w-full min-w-0 max-w-full"
    />
  )
}
