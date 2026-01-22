import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScheduleForCustomer } from "@/lib/schedule-generator";
import { startOfDay } from "date-fns";

// GET single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        jobs: {
          orderBy: { scheduledDate: "desc" },
          include: {
            _count: {
              select: { attachments: true },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        zip: data.zip,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail || null,
        hoodLengthFt: data.hoodLengthFt,
        notes: data.notes || null,
        frequencyType: data.frequencyType,
        customIntervalDays: data.customIntervalDays || null,
        firstServiceDate: data.firstServiceDate
          ? startOfDay(new Date(data.firstServiceDate))
          : undefined,
        assignedOperator: data.assignedOperator,
        salesPartner: data.salesPartner,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}

// POST regenerate schedule for customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { months = 12 } = await request.json();

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const jobsCreated = await generateScheduleForCustomer({
      customerId: customer.id,
      frequencyType: customer.frequencyType,
      customIntervalDays: customer.customIntervalDays,
      firstServiceDate: customer.firstServiceDate || new Date(),
      months,
      operatorName: customer.assignedOperator,
      salesName: customer.salesPartner,
    });

    return NextResponse.json({
      success: true,
      jobsCreated,
    });
  } catch (error) {
    console.error("Error regenerating schedule:", error);
    return NextResponse.json(
      { error: "Failed to regenerate schedule" },
      { status: 500 }
    );
  }
}
