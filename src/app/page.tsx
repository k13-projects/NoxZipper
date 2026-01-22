"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Briefcase,
  Calendar,
  AlertTriangle,
  DollarSign,
  Receipt,
  CheckCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { YearSchedule } from "@/components/year-schedule";
import Link from "next/link";

interface Stats {
  totalCustomers: number;
  totalJobsThisYear: number;
  upcomingJobs: number;
  overdueJobs: number;
  unpaidInvoicesCount: number;
  unpaidInvoicesAmount: number;
  billedThisYear: number;
  billedOperator: number;
  billedAdmin: number;
  billedSales: number;
  collectedThisYear: number;
  collectedOperator: number;
  collectedAdmin: number;
  collectedSales: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedules = async (months: number) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Created ${data.totalJobsCreated} new jobs for the next ${months} months`);
        fetchStats();
      }
    } catch (error) {
      console.error("Error generating schedules:", error);
      alert("Failed to generate schedules");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Collections Alert - Prominent at top */}
        {(stats?.unpaidInvoicesCount || 0) > 0 && (
          <div className="relative overflow-hidden rounded-xl border border-[var(--nox-accent)]/30 bg-gradient-to-r from-[var(--nox-accent)]/10 to-transparent p-6">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--nox-accent)]" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nox-accent)]/20">
                  <Receipt className="h-6 w-6 text-[var(--nox-accent)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--nox-accent)]">Outstanding Collections</p>
                  <p className="text-[var(--nox-text-secondary)]">
                    {stats?.unpaidInvoicesCount} unpaid invoice{stats?.unpaidInvoicesCount !== 1 ? "s" : ""} totaling{" "}
                    <span className="font-semibold text-[var(--nox-text-primary)]">
                      {formatCurrency(stats?.unpaidInvoicesAmount || 0)}
                    </span>
                  </p>
                </div>
              </div>
              <Link href="/collections">
                <Button>
                  View Collections
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label mb-1">Customers</p>
                  <p className="text-3xl font-bold text-[var(--nox-text-primary)]">
                    {stats?.totalCustomers || 0}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nox-bg-hover)]">
                  <Users className="h-6 w-6 text-[var(--nox-text-muted)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label mb-1">Jobs This Year</p>
                  <p className="text-3xl font-bold text-[var(--nox-text-primary)]">
                    {stats?.totalJobsThisYear || 0}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nox-bg-hover)]">
                  <Briefcase className="h-6 w-6 text-[var(--nox-text-muted)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label mb-1">Upcoming (30d)</p>
                  <p className="text-3xl font-bold text-[var(--nox-accent)]">
                    {stats?.upcomingJobs || 0}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nox-accent)]/10">
                  <Calendar className="h-6 w-6 text-[var(--nox-accent)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label mb-1">Overdue</p>
                  <p className="text-3xl font-bold text-[var(--nox-error)]">
                    {stats?.overdueJobs || 0}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nox-error)]/10">
                  <AlertTriangle className="h-6 w-6 text-[var(--nox-error)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year Schedule Overview */}
        <YearSchedule />

        {/* Revenue Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Billed */}
          <Card>
            <CardHeader className="border-b border-[var(--nox-border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--nox-bg-hover)]">
                  <DollarSign className="h-5 w-5 text-[var(--nox-text-secondary)]" />
                </div>
                <div>
                  <CardTitle className="text-base">Billed This Year</CardTitle>
                  <p className="text-xs text-[var(--nox-text-muted)]">Invoiced + Paid jobs</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[var(--nox-text-primary)] mb-6">
                {formatCurrency(stats?.billedThisYear || 0)}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--nox-border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--nox-text-secondary)]">Operator (Baha)</span>
                    <span className="text-xs text-[var(--nox-text-muted)] bg-[var(--nox-bg-hover)] px-2 py-0.5 rounded">80%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(stats?.billedOperator || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--nox-border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--nox-text-secondary)]">Admin (Kazim)</span>
                    <span className="text-xs text-[var(--nox-text-muted)] bg-[var(--nox-bg-hover)] px-2 py-0.5 rounded">10%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(stats?.billedAdmin || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--nox-text-secondary)]">Sales (Eren)</span>
                    <span className="text-xs text-[var(--nox-text-muted)] bg-[var(--nox-bg-hover)] px-2 py-0.5 rounded">10%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(stats?.billedSales || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collected */}
          <Card>
            <CardHeader className="border-b border-[var(--nox-border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--nox-accent)]/10">
                  <CheckCircle className="h-5 w-5 text-[var(--nox-accent)]" />
                </div>
                <div>
                  <CardTitle className="text-base">Collected This Year</CardTitle>
                  <p className="text-xs text-[var(--nox-text-muted)]">Paid jobs only</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[var(--nox-accent)] mb-6">
                {formatCurrency(stats?.collectedThisYear || 0)}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[var(--nox-border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--nox-text-secondary)]">Operator (Baha)</span>
                    <span className="text-xs text-[var(--nox-text-muted)] bg-[var(--nox-bg-hover)] px-2 py-0.5 rounded">80%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(stats?.collectedOperator || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--nox-border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--nox-text-secondary)]">Admin (Kazim)</span>
                    <span className="text-xs text-[var(--nox-text-muted)] bg-[var(--nox-bg-hover)] px-2 py-0.5 rounded">10%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(stats?.collectedAdmin || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--nox-text-secondary)]">Sales (Eren)</span>
                    <span className="text-xs text-[var(--nox-text-muted)] bg-[var(--nox-bg-hover)] px-2 py-0.5 rounded">10%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(stats?.collectedSales || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Generation */}
        <Card>
          <CardHeader className="border-b border-[var(--nox-border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--nox-bg-hover)]">
                <RefreshCw className="h-5 w-5 text-[var(--nox-text-secondary)]" />
              </div>
              <div>
                <CardTitle className="text-base">Schedule Generation</CardTitle>
                <p className="text-xs text-[var(--nox-text-muted)]">Auto-create jobs based on service frequency</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => handleGenerateSchedules(12)}
                disabled={generating}
              >
                {generating && <Spinner size="sm" className="mr-2" />}
                Generate Next 12 Months
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerateSchedules(24)}
                disabled={generating}
              >
                {generating && <Spinner size="sm" className="mr-2" />}
                Generate Next 24 Months
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
