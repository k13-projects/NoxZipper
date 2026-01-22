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
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalCustomers: number;
  totalJobsThisYear: number;
  upcomingJobs: number;
  overdueJobs: number;
  revenueThisYear: number;
  operatorTotalThisYear: number;
  adminTotalThisYear: number;
  salesTotalThisYear: number;
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

  const revenueCards = [
    {
      title: "Revenue This Year",
      value: formatCurrency(stats?.revenueThisYear || 0),
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Operator Total (Baha)",
      value: formatCurrency(stats?.operatorTotalThisYear || 0),
      subtitle: "80% share",
      icon: Wrench,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Admin Total (Kazim)",
      value: formatCurrency(stats?.adminTotalThisYear || 0),
      subtitle: "10% share",
      icon: User,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Sales Total (Eren)",
      value: formatCurrency(stats?.salesTotalThisYear || 0),
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

        {/* Revenue Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Revenue Split (Completed/Invoiced)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {revenueCards.map((card) => (
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
