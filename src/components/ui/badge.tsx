import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--nox-accent)] text-white",
        secondary: "bg-[var(--nox-bg-hover)] text-[var(--nox-text-primary)] border border-[var(--nox-border-default)]",
        destructive: "bg-[var(--nox-error)] text-white",
        success: "bg-[var(--nox-success)] text-white",
        warning: "bg-[var(--nox-warning)] text-black",
        outline: "border border-[var(--nox-border-default)] text-[var(--nox-text-secondary)]",
        // Status variants
        scheduled: "bg-[var(--nox-status-scheduled)]/20 text-[var(--nox-text-secondary)] border border-[var(--nox-status-scheduled)]/30",
        completed: "bg-[var(--nox-status-completed)]/15 text-[var(--nox-status-completed)] border border-[var(--nox-status-completed)]/30",
        invoiced: "bg-[var(--nox-status-invoiced)]/15 text-[var(--nox-status-invoiced)] border border-[var(--nox-status-invoiced)]/30",
        paid: "bg-[var(--nox-status-paid)]/15 text-[var(--nox-status-paid)] border border-[var(--nox-status-paid)]/30",
        overdue: "bg-[var(--nox-status-overdue)]/15 text-[var(--nox-status-overdue)] border border-[var(--nox-status-overdue)]/30",
        cancelled: "bg-[var(--nox-status-cancelled)]/15 text-[var(--nox-status-cancelled)] border border-[var(--nox-status-cancelled)]/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
