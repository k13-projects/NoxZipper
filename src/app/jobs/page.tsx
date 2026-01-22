"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  scheduledDate: string;
  status: string;
  price: number;
  operatorName: string;
  salesName: string;
  customer: {
    id: string;
    name: string;
    city: string;
    contactPhone: string;
  };
  _count: {
    attachments: number;
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    operatorName: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (filterParams = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterParams.status) params.append("status", filterParams.status);
      if (filterParams.operatorName) params.append("operatorName", filterParams.operatorName);
      if (filterParams.startDate) params.append("startDate", filterParams.startDate);
      if (filterParams.endDate) params.append("endDate", filterParams.endDate);

      const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    fetchJobs(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { status: "", operatorName: "", startDate: "", endDate: "" };
    setFilters(emptyFilters);
    fetchJobs(emptyFilters);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "scheduled" | "completed" | "invoiced" | "paid" | "cancelled"> = {
      SCHEDULED: "scheduled",
      COMPLETED: "completed",
      INVOICED: "invoiced",
      PAID: "paid",
      CANCELLED: "cancelled",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Filter Toggle */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-orange-600 px-2 py-0.5 text-xs">
                Active
              </span>
            )}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Status</label>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="INVOICED">Invoiced</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Operator</label>
                  <Input
                    placeholder="Operator name"
                    value={filters.operatorName}
                    onChange={(e) => handleFilterChange("operatorName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Start Date</label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">End Date</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={applyFilters}>Apply</Button>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Jobs ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p>No jobs found.</p>
                <Link href="/jobs/new">
                  <Button className="mt-4">Create Your First Job</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{formatDate(job.scheduledDate)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/customers/${job.customer.id}`}
                          className="font-medium hover:text-orange-500"
                        >
                          {job.customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {job.customer.city}
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{formatCurrency(job.price)}</TableCell>
                      <TableCell>{job.operatorName}</TableCell>
                      <TableCell>{job._count.attachments}</TableCell>
                      <TableCell>
                        <Link href={`/jobs/${job.id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
