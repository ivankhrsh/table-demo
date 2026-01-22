import { Skeleton } from '@/components/ui/skeleton'
import { TableBody, TableCell, TableRow } from '@/components/ui/table'

interface SkeletonLoaderProps {
  columns: number
  rowCount?: number
}

export function SkeletonLoader({
  columns,
  rowCount = 20,
}: SkeletonLoaderProps) {
  return (
    <TableBody>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell
              key={colIndex}
              className="border border-b border-l border-t-0 p-1"
            >
              <Skeleton className="h-8 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
