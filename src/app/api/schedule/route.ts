import { NextRequest, NextResponse } from "next/server";
import { generateScheduleForAllCustomers } from "@/lib/schedule-generator";

// POST generate schedule for all customers
export async function POST(request: NextRequest) {
  try {
    const { months = 12 } = await request.json();

    const totalJobsCreated = await generateScheduleForAllCustomers(months);

    return NextResponse.json({
      success: true,
      totalJobsCreated,
      months,
    });
  } catch (error) {
    console.error("Error generating schedules:", error);
    return NextResponse.json(
      { error: "Failed to generate schedules" },
      { status: 500 }
    );
  }
}
