import * as React from "react"
import { cn } from "@/lib/utils"
import { Heading } from "./heading"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-8", className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h1" variant="page" className="mb-2">
              {title}
            </Heading>
            {description && (
              <p className="mt-2 text-base text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }

