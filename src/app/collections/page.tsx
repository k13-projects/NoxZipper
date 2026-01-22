"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { DollarSign, AlertTriangle, CheckCircle, Copy, Mail } from "lucide-react";
import Link from "next/link";
import { PaymentMethod } from "@/lib/types";

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
      return <Badge variant="completed">{days} days</Badge>;
    } else if (days <= 30) {
      return <Badge variant="scheduled">{days} days</Badge>;
    } else if (days <= 60) {
      return <Badge variant="invoiced">{days} days</Badge>;
    } else {
      return <Badge variant="cancelled">{days} days</Badge>;
    }
  };

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
        // Remove from list
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Collections</h1>
            <p className="text-zinc-400">Track and manage unpaid invoices</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600/20">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Unpaid Invoices</p>
                  <p className="text-2xl font-bold">{collections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600/20">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Outstanding</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-600/20">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Over 30 Days</p>
                  <p className="text-2xl font-bold">
                    {collections.filter((c) => calculateDaysOutstanding(c.invoiceSentAt) > 30).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections Table */}
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Invoices ({collections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">All Caught Up!</p>
                <p>No outstanding invoices at this time.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Invoice Sent</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Days Outstanding</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((item) => {
                    const daysOutstanding = calculateDaysOutstanding(item.invoiceSentAt);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Link
                            href={`/customers/${item.customer.id}`}
                            className="font-medium hover:text-orange-500"
                          >
                            {item.customer.name}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono">
                          {item.invoiceNumber || "—"}
                        </TableCell>
                        <TableCell>
                          {item.invoiceSentAt ? formatDate(item.invoiceSentAt) : "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell>
                          {getDaysOutstandingBadge(daysOutstanding)}
                        </TableCell>
                        <TableCell className="text-zinc-400">
                          {item.customer.contactPhone || item.customer.contactEmail || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyReminderToClipboard(item)}
                              title="Copy reminder email"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openMailClient(item)}
                              title="Send reminder email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Link href={`/jobs/${item.id}`}>
                              <Button size="sm" variant="ghost">
                                View
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkPaid(item.id)}
                              disabled={markingPaid === item.id}
                            >
                              {markingPaid === item.id ? (
                                <Spinner className="h-4 w-4" />
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
