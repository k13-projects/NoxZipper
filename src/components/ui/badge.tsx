import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--nox-accent)] text-black",
        secondary: "bg-[var(--nox-bg-hover)] text-[var(--nox-text-primary)] border border-[var(--nox-border-default)]",
        destructive: "bg-[var(--nox-error)] text-white",
        success: "bg-[var(--nox-success)] text-black",
        warning: "bg-[var(--nox-warning)] text-black",
        outline: "border border-[var(--nox-border-default)] text-[var(--nox-text-secondary)]",
        // Minimal status variants - gray for pending, green for positive, red for negative
        scheduled: "bg-[var(--nox-bg-hover)] text-[var(--nox-text-secondary)] border border-[var(--nox-border-default)]",
        completed: "bg-[var(--nox-accent)]/15 text-[var(--nox-accent)] border border-[var(--nox-accent)]/30",
        invoiced: "bg-[var(--nox-accent)]/15 text-[var(--nox-accent)] border border-[var(--nox-accent)]/30",
        paid: "bg-[var(--nox-accent)]/15 text-[var(--nox-accent)] border border-[var(--nox-accent)]/30",
        overdue: "bg-[var(--nox-error)]/15 text-[var(--nox-error)] border border-[var(--nox-error)]/30",
        cancelled: "bg-[var(--nox-error)]/15 text-[var(--nox-error)] border border-[var(--nox-error)]/30",
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
