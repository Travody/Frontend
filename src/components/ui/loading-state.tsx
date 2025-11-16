import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  size?: "sm" | "md" | "lg"
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, message = "Loading...", size = "md", ...props }, ref) => {
    const sizeStyles = {
      sm: "h-8 w-8",
      md: "h-16 w-16",
      lg: "h-32 w-32",
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center py-12", className)}
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-b-2 border-primary-600",
            sizeStyles[size]
          )}
        />
        {message && (
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        )}
      </div>
    )
  }
)
LoadingState.displayName = "LoadingState"

export { LoadingState, Skeleton }

