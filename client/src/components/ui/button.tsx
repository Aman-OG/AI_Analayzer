import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"
import { useReducedMotion } from "../../hooks/useReducedMotion"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    isLoading?: boolean
    ariaLabel?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', isLoading = false, disabled, children, ariaLabel, ...props }, ref) => {
        const prefersReducedMotion = useReducedMotion()

        // Base styles with micro-interactions
        const baseStyles = cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
            prefersReducedMotion ? "transition-all duration-100 ease-out" : "transition-all duration-150 ease-out",
            // Focus ring styling: 4px ring with 10% opacity
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10",
            // Hover state: translate up (-2px), shadow enhancement (or instant for reduced motion)
            prefersReducedMotion ? "hover:shadow-lg" : "hover:shadow-lg hover:-translate-y-0.5",
            // Click feedback: scale down (0.95x) (or instant for reduced motion)
            prefersReducedMotion ? "" : "active:scale-95",
            // Disabled state: 50% opacity, cursor-not-allowed, no hover effects
            "disabled:pointer-events-none disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100"
        )

        const variants = {
            default: cn(
                "bg-blue-600 text-white",
                "hover:bg-blue-700",
                prefersReducedMotion ? "" : "active:bg-blue-800",
                "focus-visible:ring-blue-500/10"
            ),
            destructive: cn(
                "bg-red-600 text-white",
                "hover:bg-red-700",
                prefersReducedMotion ? "" : "active:bg-red-800",
                "focus-visible:ring-red-500/10"
            ),
            outline: cn(
                "border border-input bg-background text-foreground",
                "hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
                prefersReducedMotion ? "" : "active:bg-accent/80",
                "focus-visible:ring-primary/10"
            ),
            secondary: cn(
                "bg-secondary text-secondary-foreground",
                "hover:bg-secondary/80",
                prefersReducedMotion ? "" : "active:bg-secondary/70",
                "focus-visible:ring-secondary/10"
            ),
            ghost: cn(
                "text-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                prefersReducedMotion ? "" : "active:bg-accent/80",
                "focus-visible:ring-primary/10"
            ),
            link: cn(
                "text-blue-600 underline-offset-4",
                "hover:underline hover:text-blue-700",
                prefersReducedMotion ? "" : "active:text-blue-800",
                "focus-visible:ring-blue-500/10"
            ),
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                type="button"
                disabled={disabled || isLoading}
                aria-label={ariaLabel}
                aria-busy={isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                    </>
                ) : (
                    children
                )}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
