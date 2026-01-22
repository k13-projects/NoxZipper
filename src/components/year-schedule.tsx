"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, addDays, isSameDay } from "date-fns";

interface Job {
  id: string;
  scheduledDate: string;
  status: string;
  customer: {
    name: string;
  };
}

interface DayData {
  date: Date;
  jobs: Job[];
}

export function YearSchedule() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const year = new Date().getFullYear();
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 0, 1));

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const start = format(startDate, "yyyy-MM-dd");
        const end = format(endDate, "yyyy-MM-dd");
        const res = await fetch(`/api/jobs?startDate=${start}&endDate=${end}`);
        const data = await res.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Generate all days of the year
  const allDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, []);

  // Map jobs to days
  const dayJobsMap = useMemo(() => {
    const map = new Map<string, Job[]>();
    jobs.forEach((job) => {
      const dateKey = job.scheduledDate.split("T")[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(job);
    });
    return map;
  }, [jobs]);

  // Get color based on job count
  const getBoxColor = (count: number) => {
    if (count === 0) return "bg-[var(--nox-bg-hover)]";
    if (count === 1) return "bg-[var(--nox-accent)]/30";
    if (count === 2) return "bg-[var(--nox-accent)]/50";
    if (count === 3) return "bg-[var(--nox-accent)]/70";
    return "bg-[var(--nox-accent)]";
  };

  // Organize days into weeks (columns) starting from first day of year
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    let currentWeek: DayData[] = [];

    // Add empty cells for days before the first day of the year
    const firstDayOfWeek = getDay(startDate); // 0 = Sunday
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: addDays(startDate, -(firstDayOfWeek - i)), jobs: [] });
    }

    allDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const dayJobs = dayJobsMap.get(dateKey) || [];

      currentWeek.push({ date: day, jobs: dayJobs });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days
    if (currentWeek.length > 0) {
      // Fill the rest of the week with empty cells
      while (currentWeek.length < 7) {
        const lastDay = currentWeek[currentWeek.length - 1].date;
        currentWeek.push({ date: addDays(lastDay, 1), jobs: [] });
      }
      result.push(currentWeek);
    }

    return result;
  }, [allDays, dayJobsMap, startDate]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(d => d.date.getFullYear() === year);
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            month: format(firstDayOfWeek.date, "MMM"),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks, year]);

  const handleMouseEnter = (day: DayData, e: React.MouseEvent) => {
    if (day.date.getFullYear() !== year) return;
    setHoveredDay(day);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleDayClick = (day: DayData) => {
    if (day.jobs.length === 1) {
      router.push(`/jobs/${day.jobs[0].id}`);
    } else if (day.jobs.length > 1) {
      // Navigate to calendar with that date selected
      router.push(`/calendar`);
    }
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{year} Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-[var(--nox-border-subtle)]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{year} Schedule Overview</CardTitle>
          <div className="flex items-center gap-2 text-xs text-[var(--nox-text-muted)]">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-[var(--nox-bg-hover)]" />
              <div className="w-3 h-3 rounded-sm bg-[var(--nox-accent)]/30" />
              <div className="w-3 h-3 rounded-sm bg-[var(--nox-accent)]/50" />
              <div className="w-3 h-3 rounded-sm bg-[var(--nox-accent)]/70" />
              <div className="w-3 h-3 rounded-sm bg-[var(--nox-accent)]" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-xs text-[var(--nox-text-muted)]"
                style={{
                  position: "relative",
                  left: `${label.weekIndex * 14}px`,
                  marginRight: i < monthLabels.length - 1
                    ? `${(monthLabels[i + 1].weekIndex - label.weekIndex - 1) * 14}px`
                    : 0,
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1">
              {dayLabels.map((label, i) => (
                <div
                  key={label}
                  className="h-3 text-[10px] text-[var(--nox-text-muted)] flex items-center"
                  style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {week.map((day, dayIndex) => {
                  const isCurrentYear = day.date.getFullYear() === year;
                  const isToday = isSameDay(day.date, new Date());
                  const jobCount = day.jobs.length;

                  return (
                    <div
                      key={dayIndex}
                      className={`
                        w-3 h-3 rounded-sm cursor-pointer transition-all duration-100
                        ${isCurrentYear ? getBoxColor(jobCount) : "bg-transparent"}
                        ${isToday ? "ring-1 ring-[var(--nox-text-primary)]" : ""}
                        ${isCurrentYear && jobCount > 0 ? "hover:ring-1 hover:ring-[var(--nox-accent)]" : ""}
                      `}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => isCurrentYear && handleDayClick(day)}
                      title={isCurrentYear ? format(day.date, "MMM d, yyyy") : ""}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && hoveredDay.date.getFullYear() === year && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-[var(--nox-bg-surface)] border border-[var(--nox-border-default)] rounded-lg shadow-lg p-3 min-w-[180px]">
              <p className="text-sm font-medium text-[var(--nox-text-primary)] mb-1">
                {format(hoveredDay.date, "EEEE, MMM d")}
              </p>
              {hoveredDay.jobs.length === 0 ? (
                <p className="text-xs text-[var(--nox-text-muted)]">No jobs scheduled</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-[var(--nox-accent)]">
                    {hoveredDay.jobs.length} job{hoveredDay.jobs.length > 1 ? "s" : ""} scheduled
                  </p>
                  {hoveredDay.jobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="text-xs">
                      <span className="text-[var(--nox-text-secondary)]">{job.customer.name}</span>
                      <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                        job.status === "SCHEDULED" ? "bg-[var(--nox-bg-hover)] text-[var(--nox-text-muted)]" :
                        job.status === "COMPLETED" ? "bg-[var(--nox-success)]/20 text-[var(--nox-success)]" :
                        job.status === "PAID" ? "bg-[var(--nox-success)]/20 text-[var(--nox-success)]" :
                        "bg-[var(--nox-info)]/20 text-[var(--nox-info)]"
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                  {hoveredDay.jobs.length > 4 && (
                    <p className="text-[10px] text-[var(--nox-text-muted)]">
                      +{hoveredDay.jobs.length - 4} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-[var(--nox-border-subtle)]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--nox-text-primary)]">{jobs.length}</p>
            <p className="text-xs text-[var(--nox-text-muted)]">Total Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--nox-text-secondary)]">
              {jobs.filter(j => j.status === "SCHEDULED").length}
            </p>
            <p className="text-xs text-[var(--nox-text-muted)]">Scheduled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--nox-success)]">
              {jobs.filter(j => j.status === "COMPLETED" || j.status === "INVOICED" || j.status === "PAID").length}
            </p>
            <p className="text-xs text-[var(--nox-text-muted)]">Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--nox-accent)]">
              {new Set(jobs.map(j => j.scheduledDate.split("T")[0])).size}
            </p>
            <p className="text-xs text-[var(--nox-text-muted)]">Active Days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
