import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// POST upload file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobId = formData.get("jobId") as string | null;
    const type = formData.get("type") as string | null;

    if (!file || !jobId || !type) {
      return NextResponse.json(
        { error: "Missing required fields: file, jobId, type" },
        { status: 400 }
      );
    }

    // Validate attachment type
    const validTypes = [
      "BEFORE_PHOTO",
      "AFTER_PHOTO",
      "INVOICE_PDF",
      "SERVICE_REPORT_PDF",
      "OTHER",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid attachment type" },
        { status: 400 }
      );
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const filepath = path.join(uploadsDir, uniqueFilename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        jobId,
        type,
        filename: file.name,
        filepath: `/uploads/${uniqueFilename}`,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
