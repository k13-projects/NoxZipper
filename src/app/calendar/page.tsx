"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { startOfMonth, endOfMonth, addMonths, subMonths, format } from "date-fns";

interface Job {
  id: string;
  scheduledDate: string;
  status: string;
  customer: {
    name: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    status: string;
    customerName: string;
  };
}

// Pastel color scheme: soft & bright
const statusColors: Record<string, string> = {
  SCHEDULED: "#8B8FA3",
  COMPLETED: "#81C995",
  INVOICED: "#A8D8EA",
  PAID: "#81C995",
  CANCELLED: "#F8AFA6",
};

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchJobs = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const start = format(subMonths(startOfMonth(date), 1), "yyyy-MM-dd");
      const end = format(addMonths(endOfMonth(date), 1), "yyyy-MM-dd");

      const res = await fetch(`/api/jobs?startDate=${start}&endDate=${end}`);
      const jobs: Job[] = await res.json();

      const calendarEvents: CalendarEvent[] = jobs.map((job) => ({
        id: job.id,
        title: job.customer.name,
        start: job.scheduledDate.split("T")[0],
        backgroundColor: statusColors[job.status] || statusColors.SCHEDULED,
        borderColor: statusColors[job.status] || statusColors.SCHEDULED,
        extendedProps: {
          status: job.status,
          customerName: job.customer.name,
        },
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(currentDate);
  }, [currentDate, fetchJobs]);

  const handleEventClick = (info: { event: { id: string } }) => {
    router.push(`/jobs/${info.event.id}`);
  };

  const handleDatesSet = (info: { start: Date }) => {
    setCurrentDate(info.start);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Legend - Pastel */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: "#8B8FA3" }}></div>
            <span className="text-sm text-[var(--nox-text-secondary)]">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: "#81C995" }}></div>
            <span className="text-sm text-[var(--nox-text-secondary)]">Completed / Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: "#A8D8EA" }}></div>
            <span className="text-sm text-[var(--nox-text-secondary)]">Invoiced</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: "#F8AFA6" }}></div>
            <span className="text-sm text-[var(--nox-text-secondary)]">Cancelled</span>
          </div>
        </div>

        {/* Calendar */}
        <Card>
          <CardContent className="pt-6">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 z-10">
                <Spinner size="lg" />
              </div>
            )}
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridYear",
              }}
              height="auto"
              dayMaxEvents={4}
              eventDisplay="block"
              eventContent={(eventInfo) => (
                <div className="px-1 py-0.5 truncate text-xs text-white">
                  {eventInfo.event.title}
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Stats for current view */}
        <div className="grid gap-4 sm:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--nox-text-muted)]">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--nox-text-muted)]">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--nox-text-secondary)]">
                {events.filter((e) => e.extendedProps.status === "SCHEDULED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--nox-text-muted)]">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--nox-accent)]">
                {events.filter((e) => e.extendedProps.status === "COMPLETED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--nox-text-muted)]">Invoiced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--nox-accent)]">
                {events.filter((e) => e.extendedProps.status === "INVOICED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--nox-text-muted)]">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--nox-accent)]">
                {events.filter((e) => e.extendedProps.status === "PAID").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
