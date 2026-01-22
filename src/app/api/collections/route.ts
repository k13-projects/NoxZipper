import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all unpaid invoices for collections
export async function GET() {
  try {
    const unpaidInvoices = await prisma.job.findMany({
      where: {
        status: "INVOICED",
        paidAt: null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            contactName: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
      },
      orderBy: {
        invoiceSentAt: "asc", // Oldest first
      },
    });

    return NextResponse.json(unpaidInvoices);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
