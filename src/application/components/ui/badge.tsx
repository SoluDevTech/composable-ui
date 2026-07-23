import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/application/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-mono uppercase tracking-[0.1em] text-xs px-2 py-0.5 border rounded-none",
  {
    variants: {
      variant: {
        default: "bg-surface-warm text-fg-2 border-border",
        secondary: "bg-surface-warm text-fg-2 border-border",
        success: "bg-success/10 text-success border-success",
        warn: "bg-warn/10 text-warn border-warn",
        danger: "bg-danger/10 text-danger border-danger",
        accent: "bg-accent/10 text-accent border-accent",
        outline: "bg-transparent text-muted border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
