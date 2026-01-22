"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { CustomerForm } from "@/components/forms/customer-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Customer</h1>
            <p className="text-zinc-400">
              Create a new restaurant customer and schedule their services
            </p>
          </div>
        </div>

        <CustomerForm />
      </div>
    </DashboardLayout>
  );
}
