import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/application/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b border-border transition-colors duration-fast ease-standard",
      // Section ouverte : clairement visible (bordure + fond léger), sinon
      // le highlight ne se distingue pas du texte mute sur thème sombre.
      "border-l-2 border-l-transparent data-[state=open]:border-l-accent data-[state=open]:bg-surface-warm/40",
      className,
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex rounded-sm">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        // Pleine largeur + padding horizontal : le surlignage hover/open
        // s'étend au-delà du texte (sinon il paraît « mordu » aux deux bout,
        // collé aux champs du formulaire sans respiration).
        "-mx-3 flex flex-1 items-center justify-between rounded-sm px-3 py-4 text-fg font-display uppercase tracking-[0.06em] text-sm transition-all hover:bg-surface-warm/60 hover:text-accent focus-visible:outline-none focus-visible:shadow-focus data-[state=open]:bg-surface-warm/40 [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 transition-transform duration-base text-fg-2"
        aria-hidden="true"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm text-fg-2" {...props}>
    <div className={cn("pb-4 pt-1", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
