"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
