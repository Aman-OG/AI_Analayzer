// src/components/Loading/LoadingOverlay.tsx
import LoadingSpinner from "./LoadingSpinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
    isLoading: boolean;
    text?: string;
    className?: string;
}

export default function LoadingOverlay({
    isLoading,
    text = "Loading...",
    className
}: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div
            className={cn(
                "absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
                className
            )}
        >
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}
