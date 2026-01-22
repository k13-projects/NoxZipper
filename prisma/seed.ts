import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { addMonths, addDays, startOfDay, getDay, format } from "date-fns";

const prisma = new PrismaClient();

// =============================================================================
// EREN'S LEADS - REAL DATA ONLY
// =============================================================================

interface CustomerSeedData {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  hoodLengthFt: number;
  frequencyType: string;
  assignedOperator: string;
  salesPartner: string;
  notes: string;
  // For scheduling - which city group and day offset
  cityGroup: "carlsbad" | "littleItaly" | "laJolla" | "sanClemente";
  dayOffset: number; // Offset within city group for staggering
}

// Miramar Food Hall vendors (San Clemente) - 13 vendors
const miramarVendors = [
  "Cosmos Burger",
  "El Puerto Street Tacos",
  "Graciously Thai",
  "Hen Haus",
  "Immersion Coffee Co.",
  "It's Allll Rice",
  "La Vida",
  "Lobster Lab",
  "MOTO Pizza",
  "Norigiri",
  "RolledUp SC",
  "Sidelines Sandwiches",
  "The Pita",
];

// Hood lengths distribution (8-12 ft, realistic variation)
const hoodLengths = [8, 9, 10, 10, 11, 11, 10, 12, 9, 10, 8, 11, 10, 9, 10, 11, 12];

// Build the customer data
function buildCustomerData(): CustomerSeedData[] {
  const customers: CustomerSeedData[] = [];

  // A) Carlsbad shared kitchen (1 customer)
  customers.push({
    name: "Carlsbad Kitchen - Lobster Lab / Cosmos Burger / La Vida",
    addressLine1: "890 Palomar Airport Rd",
    addressLine2: "",
    city: "Carlsbad",
    state: "CA",
    zip: "",
    contactName: "Manager",
    contactPhone: "(858) 203-7820",
    contactEmail: null,
    hoodLengthFt: 11,
    frequencyType: "QUARTERLY",
    assignedOperator: "Baha",
    salesPartner: "Eren",
    notes: "Shared kitchen location with multiple concepts.",
    cityGroup: "carlsbad",
    dayOffset: 0,
  });

  // B) Little Italy - Good Enough
  customers.push({
    name: "Good Enough - Little Italy",
    addressLine1: "555 W Date St",
    addressLine2: "Suite B",
    city: "San Diego",
    state: "CA",
    zip: "92101",
    contactName: "Manager",
    contactPhone: "(858) 203-7820",
    contactEmail: null,
    hoodLengthFt: 10,
    frequencyType: "QUARTERLY",
    assignedOperator: "Baha",
    salesPartner: "Eren",
    notes: "Little Italy location.",
    cityGroup: "littleItaly",
    dayOffset: 0,
  });

  // C) Little Italy - Global Fork
  customers.push({
    name: "Global Fork - Little Italy",
    addressLine1: "550 W Date Street",
    addressLine2: "Suite A",
    city: "San Diego",
    state: "CA",
    zip: "92101",
    contactName: "Manager",
    contactPhone: "(858) 203-7820",
    contactEmail: null,
    hoodLengthFt: 9,
    frequencyType: "QUARTERLY",
    assignedOperator: "Baha",
    salesPartner: "Eren",
    notes: "Little Italy location - Coming Soon.",
    cityGroup: "littleItaly",
    dayOffset: 0, // Same day as Good Enough (nearby)
  });

  // D) La Jolla - Station 8
  customers.push({
    name: "Station 8 Public Market - La Jolla",
    addressLine1: "9145 Scholars Drive South",
    addressLine2: "",
    city: "La Jolla",
    state: "CA",
    zip: "92037",
    contactName: "Manager",
    contactPhone: "(858) 203-7820",
    contactEmail: null,
    hoodLengthFt: 12,
    frequencyType: "QUARTERLY",
    assignedOperator: "Baha",
    salesPartner: "Eren",
    notes: "Public market location - vendor list pending.",
    cityGroup: "laJolla",
    dayOffset: 0,
  });

  // E) San Clemente - Miramar Food Hall vendors (13 customers)
  miramarVendors.forEach((vendor, index) => {
    customers.push({
      name: `${vendor} - Miramar Food Hall (San Clemente)`,
      addressLine1: "1720 N El Camino Real",
      addressLine2: "",
      city: "San Clemente",
      state: "CA",
      zip: "92672",
      contactName: "Manager",
      contactPhone: "(949) 555-0123",
      contactEmail: null,
      hoodLengthFt: hoodLengths[index + 4] || 10, // Use varied hood lengths
      frequencyType: "QUARTERLY",
      assignedOperator: "Baha",
      salesPartner: "Eren",
      notes: "Vendor at Miramar Food Hall.",
      cityGroup: "sanClemente",
      dayOffset: Math.floor(index / 5), // Group ~5 vendors per day for efficiency
    });
  });

  return customers;
}

// =============================================================================
// SCHEDULING LOGIC
// =============================================================================

/**
 * City-based scheduling:
 * - San Clemente (Miramar): Days 1-3 of the scheduling window
 * - San Diego (Little Italy): Day 7
 * - La Jolla: Day 10
 * - Carlsbad: Day 14
 *
 * This creates route efficiency - all San Clemente jobs close together,
 * then San Diego, then La Jolla, then Carlsbad.
 */
function getCityBaseOffset(cityGroup: string): number {
  switch (cityGroup) {
    case "sanClemente":
      return 7; // Start week 2 (days 7-9)
    case "littleItaly":
      return 14; // Week 3
    case "laJolla":
      return 21; // Week 4
    case "carlsbad":
      return 28; // Week 5
    default:
      return 7;
  }
}

/**
 * Shift weekend dates to next Monday
 */
function adjustForWeekend(date: Date): Date {
  const dayOfWeek = getDay(date);
  if (dayOfWeek === 0) {
    // Sunday -> Monday
    return addDays(date, 1);
  } else if (dayOfWeek === 6) {
    // Saturday -> Monday
    return addDays(date, 2);
  }
  return date;
}

/**
 * Generate 4 quarterly job dates for a customer
 */
function generateQuarterlyDates(firstServiceDate: Date): Date[] {
  const dates: Date[] = [firstServiceDate];

  for (let i = 1; i < 4; i++) {
    let nextDate = addMonths(firstServiceDate, i * 3);
    nextDate = adjustForWeekend(nextDate);
    dates.push(nextDate);
  }

  return dates;
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("NOXZIPPER DATABASE SEED - EREN'S LEADS");
  console.log("=".repeat(60));
  console.log("");

  // -------------------------------------------------------------------------
  // STEP 1: Clear existing business data (preserve User and migrations)
  // -------------------------------------------------------------------------
  console.log("STEP 1: Clearing existing business data...");

  // Delete in FK order: Attachment -> Job -> Customer
  const deletedAttachments = await prisma.attachment.deleteMany({});
  console.log(`  - Deleted ${deletedAttachments.count} attachments`);

  const deletedJobs = await prisma.job.deleteMany({});
  console.log(`  - Deleted ${deletedJobs.count} jobs`);

  const deletedCustomers = await prisma.customer.deleteMany({});
  console.log(`  - Deleted ${deletedCustomers.count} customers`);

  console.log("");

  // -------------------------------------------------------------------------
  // STEP 2: Ensure admin user exists
  // -------------------------------------------------------------------------
  console.log("STEP 2: Ensuring admin user exists...");
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
  console.log(`  - Admin user: ${adminUser.email}`);
  console.log("");

  // -------------------------------------------------------------------------
  // STEP 3: Create customers
  // -------------------------------------------------------------------------
  console.log("STEP 3: Creating customers from Eren's leads...");

  const customerData = buildCustomerData();
  const today = startOfDay(new Date());
  const createdCustomers: Array<{ id: string; data: CustomerSeedData }> = [];

  for (const data of customerData) {
    // Calculate first service date based on city group and day offset
    const baseOffset = getCityBaseOffset(data.cityGroup);
    const totalOffset = baseOffset + data.dayOffset;
    let firstServiceDate = addDays(today, totalOffset);
    firstServiceDate = adjustForWeekend(firstServiceDate);

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
        contactEmail: data.contactEmail,
        hoodLengthFt: data.hoodLengthFt,
        frequencyType: data.frequencyType,
        assignedOperator: data.assignedOperator,
        salesPartner: data.salesPartner,
        notes: data.notes,
        firstServiceDate,
      },
    });

    createdCustomers.push({ id: customer.id, data: { ...data, dayOffset: totalOffset } });
    console.log(`  - Created: ${customer.name} (${data.city})`);
  }

  console.log("");
  console.log(`  Total customers created: ${createdCustomers.length}`);
  console.log("");

  // -------------------------------------------------------------------------
  // STEP 4: Generate quarterly jobs for each customer
  // -------------------------------------------------------------------------
  console.log("STEP 4: Generating quarterly jobs (4 per customer)...");

  let totalJobsCreated = 0;
  const jobsByCity: Record<string, number> = {};

  for (const { id: customerId, data } of createdCustomers) {
    // Get the customer's first service date
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || !customer.firstServiceDate) continue;

    const jobDates = generateQuarterlyDates(customer.firstServiceDate);
    const jobsToCreate = jobDates.map((scheduledDate) => ({
      customerId,
      scheduledDate,
      status: "SCHEDULED",
      price: 500,
      operatorShare: 400, // 80%
      adminShare: 50,     // 10%
      salesShare: 50,     // 10%
      operatorName: "Baha",
      salesName: "Eren",
      adminName: "Kazim",
      notes: null,
    }));

    await prisma.job.createMany({
      data: jobsToCreate,
    });

    totalJobsCreated += jobsToCreate.length;
    jobsByCity[data.city] = (jobsByCity[data.city] || 0) + jobsToCreate.length;
  }

  console.log("");
  console.log("  Jobs by city:");
  for (const [city, count] of Object.entries(jobsByCity)) {
    console.log(`    - ${city}: ${count} jobs`);
  }
  console.log("");
  console.log(`  Total jobs created: ${totalJobsCreated}`);
  console.log("");

  // -------------------------------------------------------------------------
  // STEP 5: Print schedule summary
  // -------------------------------------------------------------------------
  console.log("STEP 5: Schedule summary (first service dates)...");
  console.log("");

  const customersWithJobs = await prisma.customer.findMany({
    include: {
      jobs: {
        orderBy: { scheduledDate: "asc" },
        take: 1,
      },
    },
    orderBy: { city: "asc" },
  });

  let currentCity = "";
  for (const c of customersWithJobs) {
    if (c.city !== currentCity) {
      currentCity = c.city;
      console.log(`  ${currentCity}:`);
    }
    const firstJob = c.jobs[0];
    if (firstJob) {
      console.log(`    - ${c.name.substring(0, 40).padEnd(40)} ${format(firstJob.scheduledDate, "EEE MMM dd, yyyy")}`);
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("SEED COMPLETE");
  console.log("=".repeat(60));
  console.log("");
  console.log("SUMMARY:");
  console.log(`  - Customers deleted: ${deletedCustomers.count}`);
  console.log(`  - Jobs deleted: ${deletedJobs.count}`);
  console.log(`  - Attachments deleted: ${deletedAttachments.count}`);
  console.log(`  - Customers created: ${createdCustomers.length}`);
  console.log(`  - Jobs created: ${totalJobsCreated}`);
  console.log("");
  console.log("EXPECTED TOTALS:");
  console.log(`  - Customers: 17 (actual: ${createdCustomers.length})`);
  console.log(`  - Jobs: 68 (actual: ${totalJobsCreated})`);
  console.log("");

  if (createdCustomers.length !== 17) {
    console.warn("WARNING: Customer count mismatch!");
  }
  if (totalJobsCreated !== 68) {
    console.warn("WARNING: Job count mismatch!");
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
