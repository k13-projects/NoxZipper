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
  Wrench,
  User,
  TrendingUp,
  Plus,
  RefreshCw,
  Receipt,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalCustomers: number;
  totalJobsThisYear: number;
  upcomingJobs: number;
  overdueJobs: number;
  // Unpaid invoices
  unpaidInvoicesCount: number;
  unpaidInvoicesAmount: number;
  // Billed (INVOICED + PAID)
  billedThisYear: number;
  billedOperator: number;
  billedAdmin: number;
  billedSales: number;
  // Collected (PAID only)
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

  const kpiCards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Jobs This Year",
      value: stats?.totalJobsThisYear || 0,
      icon: Briefcase,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Upcoming (30 days)",
      value: stats?.upcomingJobs || 0,
      icon: Calendar,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Overdue Jobs",
      value: stats?.overdueJobs || 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const billedCards = [
    {
      title: "Billed This Year",
      value: formatCurrency(stats?.billedThisYear || 0),
      icon: DollarSign,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Operator Billed (Baha)",
      value: formatCurrency(stats?.billedOperator || 0),
      subtitle: "80% share",
      icon: Wrench,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Admin Billed (Kazim)",
      value: formatCurrency(stats?.billedAdmin || 0),
      subtitle: "10% share",
      icon: User,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Sales Billed (Eren)",
      value: formatCurrency(stats?.billedSales || 0),
      subtitle: "10% share",
      icon: TrendingUp,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  const collectedCards = [
    {
      title: "Collected This Year",
      value: formatCurrency(stats?.collectedThisYear || 0),
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Operator Collected (Baha)",
      value: formatCurrency(stats?.collectedOperator || 0),
      subtitle: "80% share",
      icon: Wrench,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Admin Collected (Kazim)",
      value: formatCurrency(stats?.collectedAdmin || 0),
      subtitle: "10% share",
      icon: User,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Sales Collected (Eren)",
      value: formatCurrency(stats?.collectedSales || 0),
      subtitle: "10% share",
      icon: TrendingUp,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-zinc-400">
              Welcome to NOXZIPPER Kitchen Exhaust Hood Cleaning
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/customers/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
            <Link href="/jobs/new">
              <Button size="sm" variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                Add Job
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Collections Alert */}
        {(stats?.unpaidInvoicesCount || 0) > 0 && (
          <Card className="border-orange-600/50 bg-orange-600/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600/20">
                    <Receipt className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-500">Outstanding Collections</p>
                    <p className="text-zinc-400">
                      {stats?.unpaidInvoicesCount} unpaid invoice{stats?.unpaidInvoicesCount !== 1 ? 's' : ''} totaling{' '}
                      <span className="font-medium text-white">
                        {formatCurrency(stats?.unpaidInvoicesAmount || 0)}
                      </span>
                    </p>
                  </div>
                </div>
                <Link href="/collections">
                  <Button variant="outline" className="border-orange-600 text-orange-500 hover:bg-orange-600/10">
                    View Collections
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billed Cards (INVOICED + PAID) */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Billed This Year (Invoiced + Paid)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {billedCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  {card.subtitle && (
                    <p className="text-xs text-zinc-500 mt-1">{card.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Collected Cards (PAID only) */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Collected This Year (Paid Only)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collectedCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  {card.subtitle && (
                    <p className="text-xs text-zinc-500 mt-1">{card.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              Generate future job schedules for all customers based on their frequency settings.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handleGenerateSchedules(12)}
                disabled={generating}
              >
                {generating ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Generate Next 12 Months
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerateSchedules(24)}
                disabled={generating}
              >
                {generating ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Generate Next 24 Months
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
