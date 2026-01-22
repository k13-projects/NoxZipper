"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DollarSign, AlertTriangle, CheckCircle, Copy, Mail, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CollectionItem {
  id: string;
  invoiceNumber: string | null;
  invoiceSentAt: string | null;
  price: number;
  customer: {
    id: string;
    name: string;
    contactName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
  };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysOutstanding = (invoiceSentAt: string | null): number => {
    if (!invoiceSentAt) return 0;
    const sentDate = new Date(invoiceSentAt);
    const today = new Date();
    const diffTime = today.getTime() - sentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysOutstandingBadge = (days: number) => {
    if (days <= 7) {
      return <Badge variant="completed">{days}d</Badge>;
    } else if (days <= 30) {
      return <Badge variant="invoiced">{days}d</Badge>;
    } else if (days <= 60) {
      return <Badge variant="warning">{days}d</Badge>;
    } else {
      return <Badge variant="overdue">{days}d</Badge>;
    }
  };

  const isOverdue = (days: number) => days > 30;

  const handleMarkPaid = async (jobId: string) => {
    setMarkingPaid(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PAID",
          paidAt: new Date().toISOString(),
          paymentMethod: PaymentMethod.OTHER,
        }),
      });

      if (res.ok) {
        setCollections(collections.filter((c) => c.id !== jobId));
      }
    } catch (error) {
      console.error("Error marking job as paid:", error);
    } finally {
      setMarkingPaid(null);
    }
  };

  const generateReminderEmail = (item: CollectionItem) => {
    const days = calculateDaysOutstanding(item.invoiceSentAt);
    const subject = `Payment Reminder - Invoice ${item.invoiceNumber || "N/A"} - ${item.customer.name}`;
    const body = `Dear ${item.customer.contactName || "Valued Customer"},

This is a friendly reminder that payment for Invoice ${item.invoiceNumber || "N/A"} is now ${days} days past due.

Invoice Details:
- Invoice Number: ${item.invoiceNumber || "N/A"}
- Amount Due: ${formatCurrency(item.price)}
- Invoice Date: ${item.invoiceSentAt ? formatDate(item.invoiceSentAt) : "N/A"}

Please remit payment at your earliest convenience.

Payment Methods:
- Zelle
- Check
- Cash
- ACH Transfer

If you have already sent payment, please disregard this reminder.

Thank you for your business!

Best regards,
NOXZIPPER Team`;

    return { subject, body };
  };

  const copyReminderToClipboard = async (item: CollectionItem) => {
    const { subject, body } = generateReminderEmail(item);
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(fullEmail);
    alert("Reminder email copied to clipboard!");
  };

  const openMailClient = (item: CollectionItem) => {
    if (!item.customer.contactEmail) {
      alert("No email address on file for this customer.");
      return;
    }
    const { subject, body } = generateReminderEmail(item);
    const mailtoUrl = `mailto:${item.customer.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank");
  };

  const totalOutstanding = collections.reduce((sum, c) => sum + c.price, 0);
  const overdueCount = collections.filter((c) => calculateDaysOutstanding(c.invoiceSentAt) > 30).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label mb-1">Unpaid Invoices</p>
                  <p className="text-3xl font-bold text-[var(--nox-text-primary)]">
                    {collections.length}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nox-accent)]/10">
                  <Clock className="h-6 w-6 text-[var(--nox-accent)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card kpi-card-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label mb-1">Total Outstanding</p>
                  <p className="text-3xl font-bold text-[var(--nox-accent)]">
                    {formatCurrency(totalOutstanding)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nox-accent)]/10">
                  <DollarSign className="h-6 w-6 text-[var(--nox-accent)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label mb-1">Overdue (30+ days)</p>
                  <p className="text-3xl font-bold text-[var(--nox-error)]">
                    {overdueCount}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nox-error)]/10">
                  <AlertTriangle className="h-6 w-6 text-[var(--nox-error)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections Table */}
        <Card>
          <CardHeader className="border-b border-[var(--nox-border-subtle)]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Payment Queue</CardTitle>
              <span className="text-sm text-[var(--nox-text-muted)]">
                {collections.length} invoice{collections.length !== 1 ? "s" : ""} pending
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Spinner size="lg" />
              </div>
            ) : collections.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="All Caught Up!"
                description="No outstanding invoices at this time. Great job staying on top of collections."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((item) => {
                    const daysOutstanding = calculateDaysOutstanding(item.invoiceSentAt);
                    const overdue = isOverdue(daysOutstanding);
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(overdue && "table-row-overdue")}
                      >
                        <TableCell>
                          <Link
                            href={`/customers/${item.customer.id}`}
                            className="font-medium text-[var(--nox-text-primary)] hover:text-[var(--nox-accent)] transition-colors"
                          >
                            {item.customer.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-[var(--nox-bg-hover)] px-2 py-1 rounded">
                            {item.invoiceNumber || "—"}
                          </code>
                        </TableCell>
                        <TableCell className="text-[var(--nox-text-secondary)]">
                          {item.invoiceSentAt ? formatDate(item.invoiceSentAt) : "—"}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[var(--nox-text-primary)]">
                            {formatCurrency(item.price)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getDaysOutstandingBadge(daysOutstanding)}
                        </TableCell>
                        <TableCell className="text-[var(--nox-text-muted)] text-sm">
                          {item.customer.contactPhone || item.customer.contactEmail || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => copyReminderToClipboard(item)}
                              title="Copy reminder email"
                              className="h-8 w-8"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openMailClient(item)}
                              title="Send reminder email"
                              className="h-8 w-8"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Link href={`/jobs/${item.id}`}>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaid(item.id)}
                              disabled={markingPaid === item.id}
                            >
                              {markingPaid === item.id ? (
                                <Spinner size="sm" />
                              ) : (
                                "Mark Paid"
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
