import * as React from "react";

import { cn } from "@/application/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-outline placeholder:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand/50 focus-visible:border-secondary-brand/60 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
