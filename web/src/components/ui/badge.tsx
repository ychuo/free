import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20',
  {
    variants: {
      variant: {
        default: 'border-sand bg-sand/50 text-olive',
        secondary: 'border-transparent bg-sand text-olive',
        outline: 'text-olive',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
