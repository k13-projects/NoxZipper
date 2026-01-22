import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const monthMap: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

export async function GET() {
  try {
    // Get the latest created branch (sorted by creation date, newest first)
    const { stdout } = await execAsync(
      "git for-each-ref --sort=-creatordate --format='%(refname:short)' refs/heads/ | head -1"
    );
    const branchName = stdout.trim();

    // Parse branch name like "Nox_Jan22_v3"
    const match = branchName.match(/Nox_([A-Za-z]+)(\d+)_v(\d+)/);

    if (match) {
      const [, monthStr, day, versionCount] = match;
      const month = monthMap[monthStr] || 1;

      // Format: month.day.vcount (e.g., 1.22.3)
      return NextResponse.json({
        version: `${month}.${day}.${versionCount}`,
        branch: branchName,
      });
    }

    // Fallback for other branch formats
    return NextResponse.json({
      version: "1.0.0",
      branch: branchName,
    });
  } catch {
    return NextResponse.json({
      version: "1.0.0",
      branch: "unknown",
    });
  }
}
