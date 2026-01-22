"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Calculator,
  LogOut,
  Menu,
  X,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/collections", label: "Collections", icon: Receipt },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/calculator", label: "Calculator", icon: Calculator },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[var(--nox-bg-surface)] border border-[var(--nox-border-default)] p-2.5 lg:hidden hover:bg-[var(--nox-bg-hover)] transition-colors"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-[var(--nox-text-primary)]" />
        ) : (
          <Menu className="h-5 w-5 text-[var(--nox-text-primary)]" />
        )}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform bg-[var(--nox-bg-elevated)] border-r border-[var(--nox-border-subtle)] transition-transform duration-200 ease-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand Mark */}
          <div className="flex items-center justify-center border-b border-[var(--nox-border-subtle)] p-3">
            <Link href="/" className="block w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/noxzipper-logo-bg.png"
                alt="NOXZIPPER"
                className="w-full h-auto object-contain"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-[var(--nox-accent-muted)] text-[var(--nox-accent)]"
                        : "text-[var(--nox-text-secondary)] hover:bg-[var(--nox-bg-hover)] hover:text-[var(--nox-text-primary)]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        active ? "text-[var(--nox-accent)]" : "text-[var(--nox-text-muted)] group-hover:text-[var(--nox-text-secondary)]"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <ChevronRight className="h-4 w-4 text-[var(--nox-accent)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-[var(--nox-border-subtle)] p-4">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--nox-bg-surface)] border border-[var(--nox-border-default)] text-sm font-semibold text-[var(--nox-text-primary)]">
                {session?.user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--nox-text-primary)] truncate">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-[var(--nox-text-muted)] truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-[var(--nox-text-muted)] hover:text-[var(--nox-text-primary)] hover:bg-[var(--nox-bg-hover)]"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* K13 Projects Footprint */}
          <div className="px-4 pb-3">
            <p className="text-[10px] text-[var(--nox-text-muted)]/40 text-center tracking-wide">
              Built by K13 Projects Software Studios
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
