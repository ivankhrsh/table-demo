export type ColumnMeta = {
  type?: 'text' | 'number' | 'select';
  options?: Array<string>;
  readonly?: boolean;
};
