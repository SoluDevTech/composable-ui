import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/application/lib/utils";

const ACTIVE_PRESS =
  "block-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-display uppercase tracking-[0.06em] text-sm transition-[background-color,border-color,color] duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: `bg-accent text-accent-on ${ACTIVE_PRESS} hover:bg-accent-hover`,
        secondary: "bg-surface-warm text-fg border border-border hover:border-fg-2",
        ghost:
          "bg-transparent text-fg-2 border border-transparent hover:bg-surface-warm hover:text-accent hover:border-accent",
        destructive: `bg-danger text-fg border border-danger ${ACTIVE_PRESS} hover:bg-danger/90`,
        success: `bg-success text-bg border border-success ${ACTIVE_PRESS} hover:bg-success/90`,
        outline: "border border-border bg-transparent text-fg hover:bg-surface-warm hover:text-fg",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6",
        icon: "h-10 w-10 rounded-none border border-border bg-surface-warm p-0 text-fg-2 hover:text-accent hover:border-accent",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
