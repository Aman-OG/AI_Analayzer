import * as React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
    // Info variant: blue color scheme
    info: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
    
    // Success variant: green color scheme
    success: "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg",
    
    // Error variant: red color scheme
    error: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
    
    // Warning variant: yellow color scheme
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-md hover:shadow-lg",
    
    // Legacy variants for backward compatibility
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
    outline: "border border-input bg-background hover:bg-accent shadow-md hover:shadow-lg",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof badgeVariants
    icon?: React.ReactNode
}

function Badge({ className, variant = "default", icon, children, ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                // Base styles with rounded pill shape (20px border-radius)
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                // Transitions for smooth hover effects
                "transition-all duration-150 ease-out",
                // Subtle shadow effect
                "shadow-sm",
                // Hover state: shadow enhancement
                "hover:shadow-md",
                // Focus ring styling
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20",
                badgeVariants[variant],
                className
            )}
            {...props}
        >
            {icon && (
                <span className="flex items-center justify-center">
                    {icon}
                </span>
            )}
            {children}
        </div>
    )
}

export { Badge, badgeVariants }
