"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getCookie } from "@/lib/utils";

// Định nghĩa interface cho Task từ API
interface Task {
  _id: string;
  name: string;
  description: string;
  status: "not_started" | "in_progress" | "review" | "completed";
  deadline: string;
  assignedTime: string;
  assigner: { _id: string; username: string } | null;
  projectId: { _id: string; projectName: string };
  userId: { _id: string; username: string };
}

// Định nghĩa interface cho TaskEvent dùng trong FullCalendar
interface TaskEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  description?: string;
  status?: string; // Thêm status nếu muốn hiển thị trong dialog
  assigner?: string; // Thêm các trường khác nếu cần
  projectName?: string;
  username?: string;
}

export default function CalendarTask() {
  const t = useTranslations("tasks");
  const tMessages = useTranslations("messages");
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TaskEvent | null>(null);
  const token = getCookie("auth_token");

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) {
        toast.error(tMessages("noToken"));
        return;
      }
      try {
        const res = await fetch("/api/tasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Không thể tải danh sách công việc");
        }

        const resp = await res.json();
        const tasks: Task[] = resp.data;

        // Chuyển đổi dữ liệu từ Task sang TaskEvent
        const taskEvents: TaskEvent[] = tasks.map((task) => ({
          id: task._id,
          title: task.name,
          start: new Date(task.assignedTime), // Thời gian bắt đầu
          end: new Date(task.deadline), // Thời gian kết thúc
          description: task.description,
          status: task.status, // Thêm status
          assigner: task.assigner?.username, // Thêm assigner
          projectName: task.projectId.projectName, // Thêm projectName
          username: task.userId.username, // Thêm username
        }));

        setEvents(taskEvents);
      } catch (error) {
        console.error("Lỗi khi fetch tasks:", error);
        toast.error(tMessages("serverError"), { duration: 5000 });
      }
    };

    fetchTasks();
  }, [token, tMessages]);

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end || undefined,
      description: event.extendedProps.description,
      status: event.extendedProps.status,
      assigner: event.extendedProps.assigner,
      projectName: event.extendedProps.projectName,
      username: event.extendedProps.username,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={viLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: t("calendar.today"),
            month: t("calendar.month"),
            week: t("calendar.week"),
            day: t("calendar.day"),
          }}
          events={events}
          selectable={false}
          editable={false}
          eventClick={handleEventClick}
          eventContent={(eventInfo) => (
            <div className="p-1">
              <p className="text-sm font-medium">{eventInfo.event.title}</p>
            </div>
          )}
          height="auto"
          eventClassNames="bg-primary/10 border-primary rounded-md cursor-pointer"
        />

        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>{t("assignedTime")}:</strong>{" "}
                {selectedEvent?.start.toLocaleString("vi-VN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              {selectedEvent?.end && (
                <p className="text-sm text-muted-foreground">
                  <strong>{t("deadline")}:</strong>{" "}
                  {selectedEvent.end.toLocaleString("vi-VN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
              {selectedEvent?.description && (
                <p className="text-sm">
                  <strong>{t("description")}:</strong> {selectedEvent.description}
                </p>
              )}
              {selectedEvent?.status && (
                <p className="text-sm">
                  <strong>{t("status")}:</strong>{" "}
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs",
                      selectedEvent.status === "not_started" && "bg-gray-200 text-gray-800",
                      selectedEvent.status === "in_progress" && "bg-yellow-200 text-yellow-800",
                      selectedEvent.status === "review" && "bg-blue-200 text-blue-800",
                      selectedEvent.status === "completed" && "bg-green-200 text-green-800"
                    )}
                  >
                    {t(`statusOptions.${selectedEvent.status}`)}
                  </span>
                </p>
              )}
              {selectedEvent?.assigner && (
                <p className="text-sm">
                  <strong>{t("assigner")}:</strong> {selectedEvent.assigner}
                </p>
              )}
              {selectedEvent?.projectName && (
                <p className="text-sm">
                  <strong>{t("projectName")}:</strong> {selectedEvent.projectName}
                </p>
              )}
              {selectedEvent?.username && (
                <p className="text-sm">
                  <strong>{t("username")}:</strong> {selectedEvent.username}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}