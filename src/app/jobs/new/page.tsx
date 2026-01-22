"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  city: string;
  assignedOperator: string;
  salesPartner: string;
}

function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || "",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    price: 500,
    operatorName: "Baha",
    salesName: "Eren",
    notes: "",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        setCustomers(data);

        // If customer is preselected, get their operator/sales defaults
        if (preselectedCustomerId) {
          const customer = data.find((c: Customer) => c.id === preselectedCustomerId);
          if (customer) {
            setFormData((prev) => ({
              ...prev,
              operatorName: customer.assignedOperator,
              salesName: customer.salesPartner,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [preselectedCustomerId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "customerId") {
      const customer = customers.find((c) => c.id === value);
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          customerId: value,
          operatorName: customer.assignedOperator,
          salesName: customer.salesPartner,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }

      const job = await res.json();
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const shares = {
    operator: formData.price * 0.8,
    admin: formData.price * 0.1,
    sales: formData.price * 0.1,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-900/50 border border-red-800 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <Select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.city}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="operatorName">Operator</Label>
                <Input
                  id="operatorName"
                  name="operatorName"
                  value={formData.operatorName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesName">Sales</Label>
                <Input
                  id="salesName"
                  name="salesName"
                  value={formData.salesName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Split Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-zinc-800 rounded-lg">
              <div className="text-sm text-zinc-400">Total Price</div>
              <div className="text-3xl font-bold text-green-500">
                {formatCurrency(formData.price)}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
                <div>
                  <span className="font-medium">{formData.operatorName}</span>
                  <span className="text-xs text-zinc-500 ml-2">Operator (80%)</span>
                </div>
                <span className="font-bold text-orange-500">
                  {formatCurrency(shares.operator)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
                <div>
                  <span className="font-medium">Kazim</span>
                  <span className="text-xs text-zinc-500 ml-2">Admin (10%)</span>
                </div>
                <span className="font-bold text-cyan-500">
                  {formatCurrency(shares.admin)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded">
                <div>
                  <span className="font-medium">{formData.salesName}</span>
                  <span className="text-xs text-zinc-500 ml-2">Sales (10%)</span>
                </div>
                <span className="font-bold text-pink-500">
                  {formatCurrency(shares.sales)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving && <Spinner size="sm" className="mr-2" />}
          Create Job
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function NewJobPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Job</h1>
            <p className="text-zinc-400">Schedule a new cleaning service</p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          }
        >
          <NewJobForm />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
