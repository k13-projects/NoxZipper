import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--nox-bg-hover)] mb-4">
        <Icon className="h-7 w-7 text-[var(--nox-text-muted)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--nox-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--nox-text-secondary)] max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <Link href={action.href}>
          <Button size="sm">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
