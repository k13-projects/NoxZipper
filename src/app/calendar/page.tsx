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

const statusColors: Record<string, string> = {
  SCHEDULED: "#52525b", // zinc-600
  COMPLETED: "#22c55e", // green-500
  INVOICED: "#3b82f6", // blue-500
  PAID: "#10b981", // emerald-500
  CANCELLED: "#ef4444", // red-500
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
        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-zinc-600"></div>
            <span className="text-sm">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm">Invoiced</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500"></div>
            <span className="text-sm">Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm">Cancelled</span>
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
              <CardTitle className="text-sm text-zinc-400">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-400">
                {events.filter((e) => e.extendedProps.status === "SCHEDULED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {events.filter((e) => e.extendedProps.status === "COMPLETED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400">Invoiced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {events.filter((e) => e.extendedProps.status === "INVOICED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {events.filter((e) => e.extendedProps.status === "PAID").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
