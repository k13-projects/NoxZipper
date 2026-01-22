import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScheduleForCustomer } from "@/lib/schedule-generator";
import { startOfDay } from "date-fns";

// GET all customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { city: { contains: search } },
              { contactPhone: { contains: search } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST create customer
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ["name", "addressLine1", "city", "state", "zip", "contactName", "contactPhone"];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const firstServiceDate = data.firstServiceDate
      ? startOfDay(new Date(data.firstServiceDate))
      : startOfDay(new Date());

    const customer = await prisma.customer.create({
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
        hoodLengthFt: data.hoodLengthFt || 10,
        notes: data.notes || null,
        frequencyType: data.frequencyType || "QUARTERLY",
        customIntervalDays: data.customIntervalDays || null,
        firstServiceDate,
        assignedOperator: data.assignedOperator || "Baha",
        salesPartner: data.salesPartner || "Eren",
      },
    });

    // Auto-generate schedule for the next 12 months
    if (data.generateSchedule !== false) {
      await generateScheduleForCustomer({
        customerId: customer.id,
        frequencyType: customer.frequencyType,
        customIntervalDays: customer.customIntervalDays,
        firstServiceDate,
        months: 12,
        operatorName: customer.assignedOperator,
        salesName: customer.salesPartner,
      });
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
