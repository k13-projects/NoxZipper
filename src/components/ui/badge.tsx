import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-orange-600 text-white",
        secondary: "border-transparent bg-zinc-700 text-zinc-100",
        destructive: "border-transparent bg-red-600 text-white",
        success: "border-transparent bg-green-600 text-white",
        warning: "border-transparent bg-yellow-600 text-white",
        outline: "border-zinc-700 text-zinc-100",
        scheduled: "border-transparent bg-zinc-600 text-white",
        completed: "border-transparent bg-green-600 text-white",
        invoiced: "border-transparent bg-blue-600 text-white",
        paid: "border-transparent bg-emerald-600 text-white",
        cancelled: "border-transparent bg-red-600 text-white",
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
