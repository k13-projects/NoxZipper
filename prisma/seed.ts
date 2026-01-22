import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { addMonths, addDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

// Constants
const FrequencyType = {
  QUARTERLY: "QUARTERLY",
  SEMIANNUAL: "SEMIANNUAL",
  CUSTOM: "CUSTOM",
} as const;

const JobStatus = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  INVOICED: "INVOICED",
  CANCELLED: "CANCELLED",
} as const;

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@noxzipper.com" },
    update: {},
    create: {
      email: "admin@noxzipper.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    },
  });
  console.log("Created admin user:", adminUser.email);

  // Demo customers
  const customers = [
    {
      name: "Mario's Italian Kitchen",
      addressLine1: "123 Main Street",
      city: "Houston",
      state: "TX",
      zip: "77001",
      contactName: "Mario Rossi",
      contactPhone: "713-555-0101",
      contactEmail: "mario@marioskitchen.com",
      hoodLengthFt: 12,
      frequencyType: FrequencyType.QUARTERLY,
      assignedOperator: "Baha",
      salesPartner: "Eren",
    },
    {
      name: "Golden Dragon Chinese",
      addressLine1: "456 Oak Avenue",
      addressLine2: "Suite 100",
      city: "Houston",
      state: "TX",
      zip: "77002",
      contactName: "David Chen",
      contactPhone: "713-555-0102",
      contactEmail: "david@goldendragon.com",
      hoodLengthFt: 16,
      frequencyType: FrequencyType.QUARTERLY,
      assignedOperator: "Baha",
      salesPartner: "Eren",
    },
    {
      name: "Tex-Mex Cantina",
      addressLine1: "789 Elm Boulevard",
      city: "Houston",
      state: "TX",
      zip: "77003",
      contactName: "Carlos Garcia",
      contactPhone: "713-555-0103",
      contactEmail: "carlos@texmexcantina.com",
      hoodLengthFt: 14,
      frequencyType: FrequencyType.SEMIANNUAL,
      assignedOperator: "Baha",
      salesPartner: "Eren",
    },
    {
      name: "BBQ Smokehouse",
      addressLine1: "321 Pine Road",
      city: "Sugar Land",
      state: "TX",
      zip: "77478",
      contactName: "Jim Wilson",
      contactPhone: "281-555-0104",
      contactEmail: "jim@bbqsmokehouse.com",
      hoodLengthFt: 20,
      frequencyType: FrequencyType.QUARTERLY,
      assignedOperator: "Baha",
      salesPartner: "Eren",
    },
    {
      name: "Sushi Paradise",
      addressLine1: "555 Cedar Lane",
      city: "Katy",
      state: "TX",
      zip: "77449",
      contactName: "Yuki Tanaka",
      contactPhone: "281-555-0105",
      contactEmail: "yuki@sushiparadise.com",
      hoodLengthFt: 10,
      frequencyType: FrequencyType.QUARTERLY,
      assignedOperator: "Baha",
      salesPartner: "Eren",
    },
  ];

  const today = startOfDay(new Date());

  for (const customerData of customers) {
    // Check if customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: { name: customerData.name },
    });

    if (existingCustomer) {
      console.log(`Customer ${customerData.name} already exists, skipping...`);
      continue;
    }

    const customer = await prisma.customer.create({
      data: {
        ...customerData,
        firstServiceDate: today,
      },
    });
    console.log(`Created customer: ${customer.name}`);

    // Generate jobs based on frequency
    const jobs = [];
    const intervalMonths = customerData.frequencyType === FrequencyType.QUARTERLY ? 3 : 6;
    const jobCount = customerData.frequencyType === FrequencyType.QUARTERLY ? 4 : 2;

    for (let i = 0; i < jobCount; i++) {
      const scheduledDate = addMonths(today, i * intervalMonths);
      const basePrice = 500;

      // First job is completed, second is in progress (for demo)
      let status: string = JobStatus.SCHEDULED;
      let completedAt: Date | null = null;

      if (i === 0) {
        status = JobStatus.COMPLETED;
        completedAt = addDays(scheduledDate, 1);
      }

      jobs.push({
        customerId: customer.id,
        scheduledDate,
        status,
        price: basePrice,
        operatorShare: basePrice * 0.8,
        adminShare: basePrice * 0.1,
        salesShare: basePrice * 0.1,
        operatorName: "Baha",
        salesName: "Eren",
        adminName: "Kazim",
        completedAt,
      });
    }

    await prisma.job.createMany({
      data: jobs,
    });
    console.log(`Created ${jobs.length} jobs for ${customer.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
