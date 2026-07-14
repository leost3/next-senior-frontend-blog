import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-mono text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
  {
    variants: {
      variant: {
        default:   'border border-transparent bg-primary text-primary-foreground',
        secondary: 'border border-transparent bg-secondary text-secondary-foreground',
        outline:   'border border-border bg-muted text-muted-foreground',
        purple:    'border border-primary/30 bg-accent text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), 'px-2 py-0.5 rounded-full', className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
