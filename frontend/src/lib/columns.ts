import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnMeta, Row } from "@/types";

// Define columns - these will match the backend schema
export const columns: Array<ColumnDef<Row>> = [
  {
    accessorKey: "id",
    header: "ID",
    size: 100,
    meta: { readonly: true } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_1",
    header: "Text 1",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_2",
    header: "Text 2",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_number_1",
    header: "Number 1",
    meta: { type: "number" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_number_2",
    header: "Number 2",
    meta: { type: "number" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_select_1",
    header: "Select 1",
    meta: {
      type: "select",
      options: ["Option A", "Option B", "Option C", "Option D"],
    } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_select_2",
    header: "Select 2",
    meta: {
      type: "select",
      options: ["Red", "Green", "Blue", "Yellow"],
    } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_3",
    header: "Text 3",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_4",
    header: "Text 4",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_number_3",
    header: "Number 3",
    meta: { type: "number" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_5",
    header: "Text 5",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_number_4",
    header: "Number 4",
    meta: { type: "number" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_select_3",
    header: "Select 3",
    meta: {
      type: "select",
      options: ["Small", "Medium", "Large", "XL"],
    } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_6",
    header: "Text 6",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_7",
    header: "Text 7",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_number_5",
    header: "Number 5",
    meta: { type: "number" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_8",
    header: "Text 8",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_select_4",
    header: "Select 4",
    meta: {
      type: "select",
      options: ["Active", "Inactive", "Pending"],
    } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_text_9",
    header: "Text 9",
    meta: { type: "text" } satisfies ColumnMeta,
  },
  {
    accessorKey: "col_number_6",
    header: "Number 6",
    meta: { type: "number" } satisfies ColumnMeta,
  },
];
