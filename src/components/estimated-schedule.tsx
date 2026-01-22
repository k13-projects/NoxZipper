"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfYear, endOfYear, getDaysInMonth, getDay, addDays, addMonths } from "date-fns";

interface EstimatedScheduleProps {
  numCustomers: number;
  frequency: "QUARTERLY" | "SEMIANNUAL";
}

interface DayData {
  date: Date;
  jobCount: number;
  dayOfMonth: number;
}

export function EstimatedSchedule({ numCustomers, frequency }: EstimatedScheduleProps) {
  const year = new Date().getFullYear();
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 0, 1));

  // Generate estimated job distribution
  const dayJobsMap = useMemo(() => {
    const map = new Map<string, number>();
    const jobsPerYear = frequency === "QUARTERLY" ? 4 : 2;
    const monthsBetween = frequency === "QUARTERLY" ? 3 : 6;

    for (let c = 0; c < numCustomers; c++) {
      const customerOffset = Math.floor((c / numCustomers) * monthsBetween * 30);

      for (let j = 0; j < jobsPerYear; j++) {
        const baseDate = addMonths(startDate, j * monthsBetween);
        let jobDate = addDays(baseDate, customerOffset % 28);

        const dayOfWeek = getDay(jobDate);
        if (dayOfWeek === 0) jobDate = addDays(jobDate, 1);
        if (dayOfWeek === 6) jobDate = addDays(jobDate, 2);

        if (jobDate >= startDate && jobDate <= endDate) {
          const dateKey = format(jobDate, "yyyy-MM-dd");
          map.set(dateKey, (map.get(dateKey) || 0) + 1);
        }
      }
    }

    return map;
  }, [numCustomers, frequency, startDate, endDate]);

  // 120 customers is max capacity for 1 team per year
  const MAX_CUSTOMERS_PER_TEAM = 120;
  const needs2Teams = numCustomers > MAX_CUSTOMERS_PER_TEAM;

  // Get color based on job count
  const getBoxStyles = (count: number) => {
    if (count === 0) return "bg-[var(--nox-bg-hover)]";

    if (!needs2Teams) {
      if (count === 1) return "bg-[var(--nox-accent)]/30";
      if (count === 2) return "bg-[var(--nox-accent)]/50";
      if (count === 3) return "bg-[var(--nox-accent)]/70";
      return "bg-[var(--nox-accent)]";
    }

    if (count === 1) return "bg-[var(--nox-accent)]/30";
    if (count === 2) return "bg-[var(--nox-accent)]/50";
    if (count === 3) return "bg-[var(--nox-accent)]/70";
    if (count === 4) return "bg-[var(--nox-accent)]";
    if (count === 5) return "bg-amber-500/60";
    if (count === 6) return "bg-amber-500/80";
    if (count === 7) return "bg-amber-500";
    return "bg-red-500";
  };

  // Calculate days needing 2 teams
  const daysNeeding2Teams = useMemo(() => {
    if (!needs2Teams) return 0;
    let count = 0;
    dayJobsMap.forEach((jobCount) => {
      if (jobCount >= 5) count++;
    });
    return count;
  }, [dayJobsMap, needs2Teams]);

  // Organize days by month
  const months = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result: { name: string; days: (DayData | null)[] }[] = [];

    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(new Date(year, month));
      const days: (DayData | null)[] = [];

      for (let day = 1; day <= 31; day++) {
        if (day <= daysInMonth) {
          const date = new Date(year, month, day);
          const dateKey = format(date, "yyyy-MM-dd");
          const jobCount = dayJobsMap.get(dateKey) || 0;
          days.push({ date, jobCount, dayOfMonth: day });
        } else {
          days.push(null);
        }
      }

      result.push({ name: monthNames[month], days });
    }

    return result;
  }, [year, dayJobsMap]);

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
          <div className="flex items-center gap-4 text-xs text-[var(--nox-text-muted)]">
            <div className="flex items-center gap-2">
              <span>{needs2Teams ? "1 Team" : "Workload"}</span>
              <div className="flex gap-1">
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-bg-hover)]" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-accent)]/30" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-accent)]/50" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-accent)]/70" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[var(--nox-accent)]" />
              </div>
            </div>
            {needs2Teams && (
              <div className="flex items-center gap-2">
                <span>2 Teams</span>
                <div className="flex gap-1">
                  <div className="w-3.5 h-3.5 rounded-sm bg-amber-500/60" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-amber-500/80" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-amber-500" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-red-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day numbers header */}
          <div className="flex gap-[2px] mb-1">
            <div className="w-10 shrink-0" />
            {Array.from({ length: 31 }, (_, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[10px] text-[var(--nox-text-muted)]"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Month rows */}
          <div className="space-y-[2px]">
            {months.map((month) => (
              <div key={month.name} className="flex gap-[2px]">
                <div className="w-10 shrink-0 text-xs font-medium text-[var(--nox-text-secondary)] flex items-center">
                  {month.name}
                </div>
                {month.days.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={dayIndex}
                        className="flex-1 aspect-square min-h-[14px] rounded-sm bg-transparent"
                      />
                    );
                  }

                  return (
                    <div
                      key={dayIndex}
                      className={`
                        flex-1 aspect-square min-h-[14px] rounded-sm
                        ${getBoxStyles(day.jobCount)}
                      `}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className={`grid gap-4 mt-6 pt-6 border-t border-[var(--nox-border-subtle)] ${needs2Teams ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
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
          {needs2Teams && (
            <div className="text-center p-3 rounded-lg bg-[var(--nox-bg-hover)]">
              <p className={`text-3xl font-bold ${daysNeeding2Teams > 0 ? "text-amber-500" : "text-[var(--nox-success)]"}`}>
                {daysNeeding2Teams}
              </p>
              <p className="text-xs text-[var(--nox-text-muted)] mt-1">Days Need 2 Teams</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
