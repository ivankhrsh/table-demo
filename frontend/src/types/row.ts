export interface Row {
  id: number;
  [key: string]: string | number | null;
}

export interface RowsResponse {
  rows: Array<Row>;
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateRowRequest {
  id: number;
  updates: Record<string, string | number | null>;
}
