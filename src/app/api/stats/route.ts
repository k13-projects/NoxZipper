import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfYear, endOfYear, addDays, startOfDay } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const today = startOfDay(now);
    const next30Days = addDays(today, 30);

    // Run all queries in parallel
    const [
      totalCustomers,
      totalJobsThisYear,
      upcomingJobs,
      overdueJobs,
      unpaidInvoices,
      billedData,
      collectedData,
    ] = await Promise.all([
      // Total customers
      prisma.customer.count(),

      // Total jobs this year
      prisma.job.count({
        where: {
          scheduledDate: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      }),

      // Upcoming jobs (next 30 days)
      prisma.job.count({
        where: {
          scheduledDate: {
            gte: today,
            lte: next30Days,
          },
          status: "SCHEDULED",
        },
      }),

      // Overdue jobs (scheduled before today and not completed/invoiced/paid/cancelled)
      prisma.job.count({
        where: {
          scheduledDate: {
            lt: today,
          },
          status: "SCHEDULED",
        },
      }),

      // Unpaid invoices (status = INVOICED and paidAt is null)
      prisma.job.aggregate({
        where: {
          status: "INVOICED",
          paidAt: null,
        },
        _count: true,
        _sum: {
          price: true,
        },
      }),

      // Billed data (INVOICED + PAID) this year
      prisma.job.aggregate({
        where: {
          scheduledDate: {
            gte: yearStart,
            lte: yearEnd,
          },
          status: {
            in: ["INVOICED", "PAID"],
          },
        },
        _sum: {
          price: true,
          operatorShare: true,
          adminShare: true,
          salesShare: true,
        },
      }),

      // Collected data (PAID only) this year
      prisma.job.aggregate({
        where: {
          scheduledDate: {
            gte: yearStart,
            lte: yearEnd,
          },
          status: "PAID",
        },
        _sum: {
          price: true,
          operatorShare: true,
          adminShare: true,
          salesShare: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalCustomers,
      totalJobsThisYear,
      upcomingJobs,
      overdueJobs,
      // Unpaid invoices
      unpaidInvoicesCount: unpaidInvoices._count || 0,
      unpaidInvoicesAmount: unpaidInvoices._sum.price || 0,
      // Billed (INVOICED + PAID)
      billedThisYear: billedData._sum.price || 0,
      billedOperator: billedData._sum.operatorShare || 0,
      billedAdmin: billedData._sum.adminShare || 0,
      billedSales: billedData._sum.salesShare || 0,
      // Collected (PAID only)
      collectedThisYear: collectedData._sum.price || 0,
      collectedOperator: collectedData._sum.operatorShare || 0,
      collectedAdmin: collectedData._sum.adminShare || 0,
      collectedSales: collectedData._sum.salesShare || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
