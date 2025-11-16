import * as React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  variant?: "default" | "page" | "section" | "subsection" | "card"
}

const headingVariants = {
  page: "text-3xl font-bold tracking-tight text-foreground",
  section: "text-2xl font-bold tracking-tight text-foreground",
  subsection: "text-lg font-semibold tracking-tight text-foreground",
  card: "text-lg font-semibold leading-none tracking-tight text-foreground",
  default: "text-xl font-semibold tracking-tight text-foreground",
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as = "h2", variant = "default", children, ...props }, ref) => {
    const Component = as
    const baseStyles = headingVariants[variant]
    
    return (
      <Component
        ref={ref}
        className={cn(baseStyles, className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Heading.displayName = "Heading"

export { Heading }

