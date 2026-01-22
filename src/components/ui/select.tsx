import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border border-[var(--nox-border-default)] bg-[var(--nox-bg-elevated)] px-3 py-2 text-sm text-[var(--nox-text-primary)] shadow-sm transition-all duration-150",
          "hover:border-[var(--nox-border-strong)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nox-accent)] focus-visible:ring-offset-0 focus-visible:border-[var(--nox-accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--nox-bg-surface)]",
          "cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
