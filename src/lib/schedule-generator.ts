import { addMonths, addDays, startOfDay, isBefore, isAfter } from "date-fns";
import { prisma } from "./prisma";
import { FrequencyType, calculateShares, DEFAULTS } from "./types";

interface GenerateScheduleParams {
  customerId: string;
  frequencyType: string;
  customIntervalDays?: number | null;
  firstServiceDate: Date;
  months?: number; // default 12
  operatorName?: string;
  salesName?: string;
}

export async function generateScheduleForCustomer({
  customerId,
  frequencyType,
  customIntervalDays,
  firstServiceDate,
  months = 12,
  operatorName = DEFAULTS.OPERATOR_NAME,
  salesName = DEFAULTS.SALES_NAME,
}: GenerateScheduleParams) {
  const startDate = startOfDay(firstServiceDate);
  const endDate = addMonths(startDate, months);

  // Get existing jobs for this customer to avoid duplicates
  const existingJobs = await prisma.job.findMany({
    where: {
      customerId,
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { scheduledDate: true },
  });

  const existingDates = new Set(
    existingJobs.map((job) => startOfDay(job.scheduledDate).getTime())
  );

  // Calculate interval based on frequency type
  let intervalDays: number;
  switch (frequencyType) {
    case FrequencyType.QUARTERLY:
      intervalDays = 91; // ~3 months
      break;
    case FrequencyType.SEMIANNUAL:
      intervalDays = 182; // ~6 months
      break;
    case FrequencyType.CUSTOM:
      intervalDays = customIntervalDays || 90;
      break;
    default:
      intervalDays = 91;
  }

  // Generate jobs
  const jobsToCreate = [];
  let currentDate = startDate;
  const price = DEFAULTS.DEFAULT_PRICE;
  const shares = calculateShares(price);

  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    const dateKey = currentDate.getTime();

    if (!existingDates.has(dateKey)) {
      jobsToCreate.push({
        customerId,
        scheduledDate: currentDate,
        status: "SCHEDULED",
        price,
        operatorShare: shares.operatorShare,
        adminShare: shares.adminShare,
        salesShare: shares.salesShare,
        operatorName,
        salesName,
        adminName: DEFAULTS.ADMIN_NAME,
      });
    }

    currentDate = addDays(currentDate, intervalDays);
  }

  // Create jobs in batch
  if (jobsToCreate.length > 0) {
    await prisma.job.createMany({
      data: jobsToCreate,
    });
  }

  return jobsToCreate.length;
}

export async function generateScheduleForAllCustomers(months = 12) {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      frequencyType: true,
      customIntervalDays: true,
      firstServiceDate: true,
      assignedOperator: true,
      salesPartner: true,
    },
  });

  let totalJobsCreated = 0;

  for (const customer of customers) {
    const startDate = customer.firstServiceDate || new Date();

    const jobsCreated = await generateScheduleForCustomer({
      customerId: customer.id,
      frequencyType: customer.frequencyType,
      customIntervalDays: customer.customIntervalDays,
      firstServiceDate: startDate,
      months,
      operatorName: customer.assignedOperator,
      salesName: customer.salesPartner,
    });

    totalJobsCreated += jobsCreated;
  }

  return totalJobsCreated;
}
