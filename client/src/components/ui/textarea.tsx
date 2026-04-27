import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean
    success?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, success, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition-all duration-300 ease-out",
                    error
                        ? "border-red-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10 focus-visible:ring-offset-2"
                        : success
                            ? "border-green-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/10 focus-visible:ring-offset-2"
                            : "border-input focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/10 focus-visible:ring-offset-2 focus-visible:border-blue-600 hover:border-blue-500/50",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
