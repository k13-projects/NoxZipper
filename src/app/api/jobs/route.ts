import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateShares, DEFAULTS } from "@/lib/types";
import { startOfDay, endOfDay } from "date-fns";

// GET all jobs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const operatorName = searchParams.get("operatorName");
    const salesName = searchParams.get("salesName");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const customerId = searchParams.get("customerId");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (operatorName) {
      where.operatorName = operatorName;
    }
    if (salesName) {
      where.salesName = salesName;
    }
    if (customerId) {
      where.customerId = customerId;
    }
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        (where.scheduledDate as Record<string, Date>).gte = startOfDay(new Date(startDate));
      }
      if (endDate) {
        (where.scheduledDate as Record<string, Date>).lte = endOfDay(new Date(endDate));
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            city: true,
            contactPhone: true,
          },
        },
        _count: {
          select: { attachments: true },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST create job
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.customerId || !data.scheduledDate) {
      return NextResponse.json(
        { error: "Missing required fields: customerId, scheduledDate" },
        { status: 400 }
      );
    }

    const price = data.price || DEFAULTS.DEFAULT_PRICE;
    const shares = calculateShares(price);

    // Check for duplicate job on same date
    const existingJob = await prisma.job.findFirst({
      where: {
        customerId: data.customerId,
        scheduledDate: startOfDay(new Date(data.scheduledDate)),
      },
    });

    if (existingJob) {
      return NextResponse.json(
        { error: "A job already exists for this customer on this date" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        customerId: data.customerId,
        scheduledDate: startOfDay(new Date(data.scheduledDate)),
        status: data.status || "SCHEDULED",
        price,
        operatorShare: shares.operatorShare,
        adminShare: shares.adminShare,
        salesShare: shares.salesShare,
        operatorName: data.operatorName || DEFAULTS.OPERATOR_NAME,
        salesName: data.salesName || DEFAULTS.SALES_NAME,
        adminName: data.adminName || DEFAULTS.ADMIN_NAME,
        notes: data.notes || null,
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
