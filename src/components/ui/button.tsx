import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nox-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nox-bg-base)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--nox-accent)] text-white shadow-sm hover:bg-[var(--nox-accent-hover)] active:scale-[0.98]",
        destructive: "bg-[var(--nox-error)] text-white shadow-sm hover:bg-red-700 active:scale-[0.98]",
        outline: "border border-[var(--nox-border-default)] bg-transparent text-[var(--nox-text-primary)] shadow-sm hover:bg-[var(--nox-bg-hover)] hover:border-[var(--nox-border-strong)]",
        secondary: "bg-[var(--nox-bg-surface)] text-[var(--nox-text-primary)] shadow-sm border border-[var(--nox-border-subtle)] hover:bg-[var(--nox-bg-hover)]",
        ghost: "text-[var(--nox-text-secondary)] hover:bg-[var(--nox-bg-hover)] hover:text-[var(--nox-text-primary)]",
        link: "text-[var(--nox-accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
