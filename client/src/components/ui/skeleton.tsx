import * as React from "react"
import { cn } from "../../lib/utils"
import { useReducedMotion } from "../../hooks/useReducedMotion"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    const prefersReducedMotion = useReducedMotion()
    
    return (
        <div
            className={cn(
                // Base styles with rounded corners
                "rounded-md",
                // Subtle background color
                "bg-slate-200 dark:bg-slate-700",
                // Animated shimmer effect: left-to-right movement (or instant for reduced motion)
                prefersReducedMotion ? "" : "animate-shimmer",
                // GPU acceleration for smooth animation
                "gpu-accelerate",
                className
            )}
            {...props}
        />
    )
}

export { Skeleton }
