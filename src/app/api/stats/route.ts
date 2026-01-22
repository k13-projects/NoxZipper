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
      revenueData,
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

      // Overdue jobs (scheduled before today and not completed/invoiced/cancelled)
      prisma.job.count({
        where: {
          scheduledDate: {
            lt: today,
          },
          status: "SCHEDULED",
        },
      }),

      // Revenue data for completed/invoiced jobs this year
      prisma.job.aggregate({
        where: {
          scheduledDate: {
            gte: yearStart,
            lte: yearEnd,
          },
          status: {
            in: ["COMPLETED", "INVOICED"],
          },
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
      revenueThisYear: revenueData._sum.price || 0,
      operatorTotalThisYear: revenueData._sum.operatorShare || 0,
      adminTotalThisYear: revenueData._sum.adminShare || 0,
      salesTotalThisYear: revenueData._sum.salesShare || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
