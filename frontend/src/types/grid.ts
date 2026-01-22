import type { ColumnDef } from '@tanstack/react-table';
import type { Row } from './row';

export interface DataGridProps {
  columns: Array<ColumnDef<Row>>;
}

export interface CellEditorProps {
  value: string | number | null;
  type: 'text' | 'number' | 'select';
  options?: Array<string>;
  onSave: (value: string | number | null) => void;
  onCancel: () => void;
}
