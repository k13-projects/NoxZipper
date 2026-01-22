"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  scheduledDate: string;
  status: string;
  price: number;
  operatorName: string;
  _count: {
    attachments: number;
  };
}

interface Customer {
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
  hoodLengthFt: number;
  notes?: string;
  frequencyType: string;
  customIntervalDays?: number;
  firstServiceDate?: string;
  assignedOperator: string;
  salesPartner: string;
  createdAt: string;
  jobs: Job[];
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) throw new Error("Customer not found");
      const data = await res.json();
      setCustomer(data);
      setEmailData({
        to: data.contactEmail || "",
        subject: `NOXZIPPER - Kitchen Hood Cleaning Service for ${data.name}`,
        body: `Dear ${data.contactName},\n\nThis is a reminder about your scheduled kitchen exhaust hood cleaning service.\n\nLocation: ${data.addressLine1}, ${data.city}, ${data.state} ${data.zip}\n\nPlease let us know if you have any questions.\n\nBest regards,\nNOXZIPPER Team`,
      });
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (months: number) => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Created ${data.jobsCreated} new jobs`);
        fetchCustomer();
      }
    } catch (error) {
      console.error("Error regenerating schedule:", error);
      alert("Failed to regenerate schedule");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer and all their jobs?")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/customers");
      } else {
        throw new Error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyEmail = () => {
    const emailText = `To: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(emailText);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
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

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "QUARTERLY":
        return "Quarterly (4x/year)";
      case "SEMIANNUAL":
        return "Semiannual (2x/year)";
      case "CUSTOM":
        return `Custom (every ${customer?.customIntervalDays} days)`;
      default:
        return freq;
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

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-4">Customer not found</p>
          <Link href="/customers">
            <Button>Back to Customers</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/customers">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <p className="text-zinc-400 flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {customer.city}, {customer.state}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmailModalOpen(true)}
              disabled={!customer.contactEmail}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Link href={`/customers/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
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
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Contact</p>
                <p className="font-medium">{customer.contactName}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Phone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${customer.contactPhone}`} className="hover:text-orange-500">
                    {customer.contactPhone}
                  </a>
                </p>
              </div>
              {customer.contactEmail && (
                <div>
                  <p className="text-sm text-zinc-400">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${customer.contactEmail}`} className="hover:text-orange-500">
                      {customer.contactEmail}
                    </a>
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-400">Address</p>
                <p className="font-medium">
                  {customer.addressLine1}
                  {customer.addressLine2 && <br />}
                  {customer.addressLine2}
                  <br />
                  {customer.city}, {customer.state} {customer.zip}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Hood Length</p>
                <p className="font-medium">{customer.hoodLengthFt} ft</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Service Frequency</p>
                <p className="font-medium">{getFrequencyLabel(customer.frequencyType)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Assigned Operator</p>
                <p className="font-medium">{customer.assignedOperator}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Sales Partner</p>
                <p className="font-medium">{customer.salesPartner}</p>
              </div>
              {customer.notes && (
                <div>
                  <p className="text-sm text-zinc-400">Notes</p>
                  <p className="text-sm">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Jobs */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Jobs ({customer.jobs.length})</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegenerate(12)}
                  disabled={regenerating}
                >
                  {regenerating ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  +12 Months
                </Button>
                <Link href={`/jobs/new?customerId=${customer.id}`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {customer.jobs.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No jobs scheduled yet.</p>
                  <p className="text-sm mt-2">
                    Click &quot;+12 Months&quot; to generate a schedule.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{formatDate(job.scheduledDate)}</TableCell>
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
      </div>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent onClose={() => setEmailModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Email Customer</DialogTitle>
            <DialogDescription>
              Compose an email to {customer.contactName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCopyEmail}>
              {emailCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            <a
              href={`mailto:${emailData.to}?subject=${encodeURIComponent(
                emailData.subject
              )}&body=${encodeURIComponent(emailData.body)}`}
            >
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Open Email Client
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
