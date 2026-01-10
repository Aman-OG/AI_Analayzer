// src/components/Loading/TableSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div className="w-full space-y-3">
            {/* Table Header */}
            <div className="flex gap-4 pb-3 border-b">
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton key={`header-${index}`} className="h-5 flex-1" />
                ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4 py-3">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={`cell-${rowIndex}-${colIndex}`}
                            className="h-4 flex-1"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
