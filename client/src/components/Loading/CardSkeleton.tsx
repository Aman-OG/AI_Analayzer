// src/components/Loading/CardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CardSkeletonProps {
    count?: number;
    showHeader?: boolean;
    showFooter?: boolean;
}

export default function CardSkeleton({
    count = 1,
    showHeader = true,
    showFooter = false
}: CardSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="w-full">
                    {showHeader && (
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                    )}
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                    </CardContent>
                    {showFooter && (
                        <div className="px-6 pb-6">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    )}
                </Card>
            ))}
        </>
    );
}
