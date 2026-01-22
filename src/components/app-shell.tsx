"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AppShellProps {
  children: ReactNode;
}

const pageConfig: Record<string, { title: string; subtitle?: string; action?: { label: string; href: string } }> = {
  "/": { title: "Dashboard", subtitle: "Business overview and key metrics" },
  "/customers": {
    title: "Customers",
    subtitle: "Manage restaurant accounts",
    action: { label: "Add Customer", href: "/customers/new" }
  },
  "/jobs": {
    title: "Jobs",
    subtitle: "Track cleaning services",
    action: { label: "Add Job", href: "/jobs/new" }
  },
  "/collections": {
    title: "Collections",
    subtitle: "Outstanding invoices & payments"
  },
  "/calendar": {
    title: "Calendar",
    subtitle: "Service schedule overview"
  },
  "/calculator": {
    title: "Calculator",
    subtitle: "Revenue projections & splits"
  },
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Get base path for dynamic routes
  const basePath = pathname.startsWith("/customers/") && pathname !== "/customers/new"
    ? "/customers/[id]"
    : pathname.startsWith("/jobs/") && pathname !== "/jobs/new"
    ? "/jobs/[id]"
    : pathname;

  const config = pageConfig[basePath] || pageConfig[pathname] || { title: "NOXZIPPER" };

  return (
    <div className="min-h-screen bg-[var(--nox-bg-base)]">
      <Sidebar />
      <main className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-[var(--nox-border-subtle)] bg-[var(--nox-bg-surface)]">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              {/* Mobile spacer for hamburger menu */}
              <div className="w-8 lg:hidden" />
              <div>
                <h1 className="text-lg font-semibold text-[var(--nox-text-primary)]">
                  {config.title}
                </h1>
                {config.subtitle && (
                  <p className="text-xs text-[var(--nox-text-muted)]">
                    {config.subtitle}
                  </p>
                )}
              </div>
            </div>
            {config.action && (
              <Link href={config.action.href}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {config.action.label}
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
