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
    // Get the latest merged branch from main's merge commits
    const { stdout } = await execAsync(
      "git log main --oneline --merges -1 --format='%s' | grep -oE 'Nox_[A-Za-z]+[0-9]+_v[0-9]+' || git branch --show-current"
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
