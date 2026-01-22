"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, addDays, addMonths } from "date-fns";

interface EstimatedScheduleProps {
  numCustomers: number;
  frequency: "QUARTERLY" | "SEMIANNUAL";
}

interface DayData {
  date: Date;
  jobCount: number;
}

export function EstimatedSchedule({ numCustomers, frequency }: EstimatedScheduleProps) {
  const year = new Date().getFullYear();
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 0, 1));

  // Generate all days of the year
  const allDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, []);

  // Generate estimated job distribution
  const dayJobsMap = useMemo(() => {
    const map = new Map<string, number>();
    const jobsPerYear = frequency === "QUARTERLY" ? 4 : 2;
    const monthsBetween = frequency === "QUARTERLY" ? 3 : 6;

    // Distribute customers across business days (Mon-Fri)
    // Start from different months to spread the load
    for (let c = 0; c < numCustomers; c++) {
      // Offset each customer's first service by spreading across the first period
      const customerOffset = Math.floor((c / numCustomers) * monthsBetween * 30);

      for (let j = 0; j < jobsPerYear; j++) {
        // Calculate the approximate date for this job
        const baseDate = addMonths(startDate, j * monthsBetween);
        let jobDate = addDays(baseDate, customerOffset % 28); // Keep within month

        // Adjust to a weekday (Mon-Fri)
        const dayOfWeek = getDay(jobDate);
        if (dayOfWeek === 0) jobDate = addDays(jobDate, 1); // Sunday -> Monday
        if (dayOfWeek === 6) jobDate = addDays(jobDate, 2); // Saturday -> Monday

        // Make sure we're within the year
        if (jobDate >= startDate && jobDate <= endDate) {
          const dateKey = format(jobDate, "yyyy-MM-dd");
          map.set(dateKey, (map.get(dateKey) || 0) + 1);
        }
      }
    }

    return map;
  }, [numCustomers, frequency, startDate, endDate]);

  // Get color based on job count (all future/estimated)
  const getBoxStyles = (count: number) => {
    if (count === 0) return "bg-[var(--nox-bg-hover)]";
    if (count === 1) return "bg-[var(--nox-accent)]/40";
    if (count === 2) return "bg-[var(--nox-accent)]/60";
    if (count === 3) return "bg-[var(--nox-accent)]/80";
    return "bg-[var(--nox-accent)]";
  };

  // Organize days into weeks
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    let currentWeek: DayData[] = [];

    const firstDayOfWeek = getDay(startDate);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: addDays(startDate, -(firstDayOfWeek - i)), jobCount: 0 });
    }

    allDays.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const jobCount = dayJobsMap.get(dateKey) || 0;

      currentWeek.push({ date: day, jobCount });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDay = currentWeek[currentWeek.length - 1].date;
        currentWeek.push({ date: addDays(lastDay, 1), jobCount: 0 });
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

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totalJobs = numCustomers * (frequency === "QUARTERLY" ? 4 : 2);
  const jobsPerMonth = totalJobs / 12;

  return (
    <Card>
      <CardHeader className="border-b border-[var(--nox-border-subtle)] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Estimated {year} Schedule</CardTitle>
            <p className="text-sm text-[var(--nox-text-muted)] mt-1">
              Preview of workload distribution based on your inputs
            </p>
          </div>
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
      </CardHeader>
      <CardContent className="pt-6 overflow-x-auto">
        <div className="w-full">
          {/* Month labels */}
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

            {/* Weeks */}
            <div className="flex-1 flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex-1 flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => {
                    const isCurrentYear = day.date.getFullYear() === year;

                    return (
                      <div
                        key={dayIndex}
                        className={`
                          w-full aspect-square min-h-4 rounded-sm transition-all duration-150
                          ${isCurrentYear ? getBoxStyles(day.jobCount) : "bg-transparent"}
                        `}
                        title={isCurrentYear && day.jobCount > 0 ? `${day.jobCount} estimated job${day.jobCount > 1 ? 's' : ''} - ${format(day.date, "MMM d")}` : undefined}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--nox-border-subtle)]">
          <div className="text-center p-3 rounded-lg bg-[var(--nox-bg-hover)]">
            <p className="text-3xl font-bold text-[var(--nox-text-primary)]">{totalJobs}</p>
            <p className="text-xs text-[var(--nox-text-muted)] mt-1">Total Jobs/Year</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--nox-bg-hover)]">
            <p className="text-3xl font-bold text-[var(--nox-accent)]">{jobsPerMonth.toFixed(1)}</p>
            <p className="text-xs text-[var(--nox-text-muted)] mt-1">Avg Jobs/Month</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[var(--nox-bg-hover)]">
            <p className="text-3xl font-bold text-[var(--nox-text-secondary)]">{(totalJobs / 52).toFixed(1)}</p>
            <p className="text-xs text-[var(--nox-text-muted)] mt-1">Avg Jobs/Week</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
