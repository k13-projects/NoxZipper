"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, addDays, isSameDay, isBefore, startOfDay } from "date-fns";

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

  const today = startOfDay(new Date());
  const year = today.getFullYear();
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

  // Get color based on job count and past/future status
  const getBoxStyles = (count: number, isPast: boolean, isToday: boolean) => {
    // Base opacity for past days
    const pastOpacity = isPast ? "opacity-40" : "";

    if (isToday) {
      if (count === 0) return "bg-[var(--nox-accent)]/20 ring-2 ring-[var(--nox-accent)]";
      if (count === 1) return "bg-[var(--nox-accent)]/50 ring-2 ring-[var(--nox-accent)]";
      if (count === 2) return "bg-[var(--nox-accent)]/70 ring-2 ring-[var(--nox-accent)]";
      return "bg-[var(--nox-accent)] ring-2 ring-[var(--nox-accent)]";
    }

    if (isPast) {
      // Past days - dimmed colors
      if (count === 0) return "bg-[var(--nox-bg-elevated)] opacity-50";
      if (count === 1) return "bg-[var(--nox-text-muted)]/30 opacity-60";
      if (count === 2) return "bg-[var(--nox-text-muted)]/40 opacity-60";
      if (count === 3) return "bg-[var(--nox-text-muted)]/50 opacity-60";
      return "bg-[var(--nox-text-muted)]/60 opacity-60";
    }

    // Future days - vibrant accent colors
    if (count === 0) return "bg-[var(--nox-bg-hover)]";
    if (count === 1) return "bg-[var(--nox-accent)]/40";
    if (count === 2) return "bg-[var(--nox-accent)]/60";
    if (count === 3) return "bg-[var(--nox-accent)]/80";
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

  // Month labels with better positioning
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
      router.push(`/calendar`);
    }
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate stats
  const pastJobs = jobs.filter(j => isBefore(new Date(j.scheduledDate), today));
  const futureJobs = jobs.filter(j => !isBefore(new Date(j.scheduledDate), today));
  const completedJobs = jobs.filter(j => j.status === "COMPLETED" || j.status === "INVOICED" || j.status === "PAID");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{year} Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-[var(--nox-border-subtle)] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{year} Schedule Overview</CardTitle>
            <p className="text-sm text-[var(--nox-text-muted)] mt-1">
              Hover over days to see scheduled jobs
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Past/Future Legend */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[var(--nox-text-muted)]/40 opacity-60" />
                <span className="text-[var(--nox-text-muted)]">Past</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[var(--nox-accent)]/60" />
                <span className="text-[var(--nox-text-muted)]">Future</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[var(--nox-accent)]/30 ring-2 ring-[var(--nox-accent)]" />
                <span className="text-[var(--nox-text-muted)]">Today</span>
              </div>
            </div>
            {/* Intensity Legend */}
            <div className="flex items-center gap-2 text-xs text-[var(--nox-text-muted)]">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-bg-hover)]" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-accent)]/40" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-accent)]/60" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-accent)]/80" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-accent)]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 overflow-x-auto">
        <div className="w-full">
          {/* Month labels - positioned absolutely above grid */}
          <div className="relative h-6 mb-2">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="absolute text-sm font-medium text-[var(--nox-text-secondary)]"
                style={{
                  left: `calc(${(label.weekIndex / weeks.length) * 100}% + 36px)`,
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2 pt-0">
              {dayLabels.map((label) => (
                <div
                  key={label}
                  className="h-4 text-xs text-[var(--nox-text-muted)] flex items-center justify-end pr-1 w-8"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks - expanded to fill width */}
            <div className="flex-1 flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex-1 flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => {
                    const isCurrentYear = day.date.getFullYear() === year;
                    const isToday = isSameDay(day.date, today);
                    const isPast = isBefore(day.date, today) && !isToday;
                    const jobCount = day.jobs.length;

                    return (
                      <div
                        key={dayIndex}
                        className={`
                          w-full aspect-square min-h-4 rounded-sm cursor-pointer transition-all duration-150
                          ${isCurrentYear ? getBoxStyles(jobCount, isPast, isToday) : "bg-transparent"}
                          ${isCurrentYear && jobCount > 0 && !isToday ? "hover:ring-1 hover:ring-[var(--nox-accent)] hover:opacity-100" : ""}
                          ${isCurrentYear && !isPast && !isToday ? "hover:scale-110" : ""}
                        `}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => isCurrentYear && handleDayClick(day)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
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
            <div className="bg-[var(--nox-bg-surface)] border border-[var(--nox-border-default)] rounded-lg shadow-xl p-4 min-w-[220px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[var(--nox-text-primary)]">
                  {format(hoveredDay.date, "EEEE")}
                </p>
                <p className="text-xs text-[var(--nox-text-muted)]">
                  {format(hoveredDay.date, "MMM d, yyyy")}
                </p>
              </div>

              {isBefore(hoveredDay.date, today) && !isSameDay(hoveredDay.date, today) && (
                <p className="text-[10px] uppercase tracking-wider text-[var(--nox-text-muted)] mb-2">Past</p>
              )}
              {isSameDay(hoveredDay.date, today) && (
                <p className="text-[10px] uppercase tracking-wider text-[var(--nox-accent)] mb-2 font-medium">Today</p>
              )}
              {!isBefore(hoveredDay.date, today) && !isSameDay(hoveredDay.date, today) && (
                <p className="text-[10px] uppercase tracking-wider text-[var(--nox-accent)] mb-2">Upcoming</p>
              )}

              {hoveredDay.jobs.length === 0 ? (
                <p className="text-sm text-[var(--nox-text-muted)]">No jobs scheduled</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--nox-accent)]">
                    {hoveredDay.jobs.length} job{hoveredDay.jobs.length > 1 ? "s" : ""}
                  </p>
                  <div className="space-y-1.5">
                    {hoveredDay.jobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[var(--nox-text-secondary)] truncate max-w-[140px]">
                          {job.customer.name}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${
                          job.status === "SCHEDULED" ? "bg-[var(--nox-bg-hover)] text-[var(--nox-text-muted)]" :
                          job.status === "COMPLETED" ? "bg-[var(--nox-success)]/20 text-[var(--nox-success)]" :
                          job.status === "PAID" ? "bg-[var(--nox-success)]/20 text-[var(--nox-success)]" :
                          "bg-[var(--nox-info)]/20 text-[var(--nox-info)]"
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    ))}
                    {hoveredDay.jobs.length > 5 && (
                      <p className="text-[10px] text-[var(--nox-text-muted)] pt-1">
                        +{hoveredDay.jobs.length - 5} more...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--nox-border-subtle)]">
          <div className="text-center p-3 rounded-lg bg-[var(--nox-bg-hover)]">
            <p className="text-3xl font-bold text-[var(--nox-text-primary)]">{jobs.length}</p>
            <p className="text-xs text-[var(--nox-text-muted)] mt-1">Total Jobs</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--nox-bg-hover)]">
            <p className="text-3xl font-bold text-[var(--nox-text-muted)]">{pastJobs.length}</p>
            <p className="text-xs text-[var(--nox-text-muted)] mt-1">Past</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--nox-bg-hover)]">
            <p className="text-3xl font-bold text-[var(--nox-accent)]">{futureJobs.length}</p>
            <p className="text-xs text-[var(--nox-text-muted)] mt-1">Upcoming</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--nox-bg-hover)]">
            <p className="text-3xl font-bold text-[var(--nox-success)]">{completedJobs.length}</p>
            <p className="text-xs text-[var(--nox-text-muted)] mt-1">Completed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
