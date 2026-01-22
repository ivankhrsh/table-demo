import React from 'react';
import { flexRender } from '@tanstack/react-table';
import type { HeaderGroup } from '@tanstack/react-table';
import type { Row } from '@/types';
import { cn } from '@/lib/utils';
import { TableHeader as ShadcnTableHeader, TableRow as ShadcnTableRow, TableHead } from '@/components/ui/table';

interface TableHeaderProps {
  headerGroups: Array<HeaderGroup<Row>>;
}

function TableHeader({ headerGroups }: TableHeaderProps) {
  return (
    <ShadcnTableHeader className="sticky top-0 bg-background z-10">
      {headerGroups.map((headerGroup) => (
        <ShadcnTableRow key={headerGroup.id}>
          {headerGroup.headers.map((header, index) => {
            const columnSize = header.getSize();
            return (
              <TableHead
                key={header.id}
                className={cn(
                  'border border-t text-center border-b border-l p-2 w-(--column-width) min-w-(--column-width) max-w-(--column-width)',
                  index === headerGroup.headers.length - 1 ? 'border-r' : 'border-r-0'
                )}
                style={{
                  '--column-width': `${columnSize}px`,
                } as React.CSSProperties & { '--column-width': string }}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            );
          })}
        </ShadcnTableRow>
      ))}
    </ShadcnTableHeader>
  );
}

// Memoize header since it rarely changes
export const TableHeaderMemo = React.memo(TableHeader);

// Export with original name for backward compatibility
export { TableHeaderMemo as TableHeader };
