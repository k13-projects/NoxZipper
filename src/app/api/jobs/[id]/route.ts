import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateShares } from "@/lib/types";
import { startOfDay } from "date-fns";

// GET single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: true,
        attachments: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// PUT update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updateData: Record<string, unknown> = {};

    if (data.scheduledDate !== undefined) {
      updateData.scheduledDate = startOfDay(new Date(data.scheduledDate));
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Set completedAt when status changes to COMPLETED
      if (data.status === "COMPLETED") {
        updateData.completedAt = new Date();
      } else if (data.status === "SCHEDULED") {
        updateData.completedAt = null;
      }
    }
    if (data.price !== undefined) {
      updateData.price = data.price;
      // Recalculate shares
      const shares = calculateShares(data.price);
      updateData.operatorShare = shares.operatorShare;
      updateData.adminShare = shares.adminShare;
      updateData.salesShare = shares.salesShare;
    }
    if (data.operatorName !== undefined) {
      updateData.operatorName = data.operatorName;
    }
    if (data.salesName !== undefined) {
      updateData.salesName = data.salesName;
    }
    if (data.adminName !== undefined) {
      updateData.adminName = data.adminName;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        attachments: true,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
