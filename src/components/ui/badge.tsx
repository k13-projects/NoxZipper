import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--nox-accent)] text-[#1a1a1f]",
        secondary: "bg-[var(--nox-bg-hover)] text-[var(--nox-text-primary)] border border-[var(--nox-border-default)]",
        destructive: "bg-[var(--nox-error)] text-[#1a1a1f]",
        success: "bg-[var(--nox-success)] text-[#1a1a1f]",
        warning: "bg-[var(--nox-warning)] text-[#1a1a1f]",
        outline: "border border-[var(--nox-border-default)] text-[var(--nox-text-secondary)]",
        // Pastel status variants - soft & bright
        scheduled: "bg-[var(--nox-bg-hover)] text-[var(--nox-text-secondary)] border border-[var(--nox-border-default)]",
        completed: "bg-[var(--nox-success)]/20 text-[var(--nox-success)] border border-[var(--nox-success)]/35",
        invoiced: "bg-[var(--nox-info)]/20 text-[var(--nox-info)] border border-[var(--nox-info)]/35",
        paid: "bg-[var(--nox-success)]/20 text-[var(--nox-success)] border border-[var(--nox-success)]/35",
        overdue: "bg-[var(--nox-error)]/20 text-[var(--nox-error)] border border-[var(--nox-error)]/35",
        cancelled: "bg-[var(--nox-error)]/20 text-[var(--nox-error)] border border-[var(--nox-error)]/35",
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
