// src/components/Loading/ListSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
    count?: number;
    showAvatar?: boolean;
    showActions?: boolean;
}

export default function ListSkeleton({
    count = 3,
    showAvatar = false,
    showActions = false
}: ListSkeletonProps) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    {showAvatar && (
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    {showActions && (
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
