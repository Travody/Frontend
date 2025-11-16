import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "primary"
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-white",
      muted: "bg-gray-50",
      primary: "bg-primary-600 text-white",
    }

    return (
      <section
        ref={ref}
        className={cn("py-16 md:py-24", variantStyles[variant], className)}
        {...props}
      />
    )
  }
)
Section.displayName = "Section"

export { Section }

