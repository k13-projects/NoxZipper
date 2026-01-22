"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Trash2,
  CheckCircle,
  Upload,
  FileImage,
  FileText,
  X,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";

interface Attachment {
  id: string;
  type: string;
  filename: string;
  filepath: string;
  uploadedAt: string;
}

interface Job {
  id: string;
  scheduledDate: string;
  status: string;
  price: number;
  operatorShare: number;
  adminShare: number;
  salesShare: number;
  operatorName: string;
  salesName: string;
  adminName: string;
  completedAt: string | null;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zip: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
  };
  attachments: Attachment[];
}

const attachmentTypes = [
  { value: "BEFORE_PHOTO", label: "Before Photo", icon: FileImage },
  { value: "AFTER_PHOTO", label: "After Photo", icon: FileImage },
  { value: "INVOICE_PDF", label: "Invoice PDF", icon: FileText },
  { value: "SERVICE_REPORT_PDF", label: "Service Report PDF", icon: FileText },
  { value: "OTHER", label: "Other", icon: FileText },
];

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editPrice, setEditPrice] = useState(0);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [uploadType, setUploadType] = useState("BEFORE_PHOTO");

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error("Job not found");
      const data = await res.json();
      setJob(data);
      setEditPrice(data.price);
      setEditStatus(data.status);
      setEditNotes(data.notes || "");
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: editPrice,
          status: editStatus,
          notes: editNotes,
        }),
      });
      if (res.ok) {
        await fetchJob();
      }
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCompleted = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        await fetchJob();
      }
    } catch (error) {
      console.error("Error completing job:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("jobId", id);
        formData.append("type", uploadType);

        await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      }
      await fetchJob();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Delete this attachment?")) return;
    try {
      await fetch(`/api/upload/${attachmentId}`, { method: "DELETE" });
      await fetchJob();
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "scheduled" | "completed" | "invoiced" | "cancelled"> = {
      SCHEDULED: "scheduled",
      COMPLETED: "completed",
      INVOICED: "invoiced",
      CANCELLED: "cancelled",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const calculateShares = (price: number) => ({
    operator: price * 0.8,
    admin: price * 0.1,
    sales: price * 0.1,
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-4">Job not found</p>
          <Link href="/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const shares = calculateShares(editPrice);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/jobs">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Job: {formatDate(job.scheduledDate)}</h1>
                {getStatusBadge(job.status)}
              </div>
              <Link
                href={`/customers/${job.customer.id}`}
                className="text-zinc-400 hover:text-orange-500"
              >
                {job.customer.name}
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.status === "SCHEDULED" && (
              <Button onClick={handleMarkCompleted} disabled={saving}>
                {saving ? <Spinner size="sm" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Mark Completed
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner size="sm" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Link
                  href={`/customers/${job.customer.id}`}
                  className="font-medium text-lg hover:text-orange-500"
                >
                  {job.customer.name}
                </Link>
              </div>
              <div className="flex items-start gap-2 text-sm text-zinc-400">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div>
                  {job.customer.addressLine1}
                  {job.customer.addressLine2 && <>, {job.customer.addressLine2}</>}
                  <br />
                  {job.customer.city}, {job.customer.state} {job.customer.zip}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-zinc-400" />
                <a
                  href={`tel:${job.customer.contactPhone}`}
                  className="hover:text-orange-500"
                >
                  {job.customer.contactPhone}
                </a>
              </div>
              <p className="text-sm text-zinc-400">{job.customer.contactName}</p>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="INVOICED">Invoiced</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Spinner size="sm" className="mr-2" /> : null}
                Save Changes
              </Button>
              {job.completedAt && (
                <p className="text-xs text-zinc-500">
                  Completed: {formatDateTime(job.completedAt)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Revenue Split */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Split (80/10/10)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-zinc-800 rounded-lg">
                <div className="text-sm text-zinc-400">Total Price</div>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(editPrice)}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-zinc-400">Operator ({job.operatorName})</span>
                    <span className="text-xs text-zinc-500 ml-2">80%</span>
                  </div>
                  <span className="font-medium text-orange-500">
                    {formatCurrency(shares.operator)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-zinc-400">Admin ({job.adminName})</span>
                    <span className="text-xs text-zinc-500 ml-2">10%</span>
                  </div>
                  <span className="font-medium text-cyan-500">
                    {formatCurrency(shares.admin)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-zinc-400">Sales ({job.salesName})</span>
                    <span className="text-xs text-zinc-500 ml-2">10%</span>
                  </div>
                  <span className="font-medium text-pink-500">
                    {formatCurrency(shares.sales)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attachments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attachments ({job.attachments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Upload Section */}
            <div className="mb-6 p-4 border border-dashed border-zinc-700 rounded-lg">
              <div className="flex flex-wrap gap-4 items-center">
                <Select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-48"
                >
                  {attachmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                <label className="cursor-pointer inline-flex">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 border border-zinc-700 bg-transparent text-zinc-100 shadow-sm hover:bg-zinc-800 h-9 px-4 py-2">
                    {uploading ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Files
                  </span>
                </label>
              </div>
            </div>

            {/* Attachment List */}
            {job.attachments.length === 0 ? (
              <p className="text-center text-zinc-400 py-4">No attachments yet</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {job.attachments.map((attachment) => {
                  const typeInfo = attachmentTypes.find((t) => t.value === attachment.type);
                  const Icon = typeInfo?.icon || FileText;

                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg"
                    >
                      <div className="p-2 bg-zinc-700 rounded">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {typeInfo?.label || attachment.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-red-500"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
