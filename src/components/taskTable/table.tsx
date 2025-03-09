"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { MoreVertical, Eye } from "lucide-react";
import { toast } from "sonner";
import { getCookie } from "@/lib/utils";

// Định nghĩa interface cho Task
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

const TaskTable = () => {
  const t = useTranslations("tasks");
  const tMessages = useTranslations("messages");
  const [data, setData] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        setData(resp.data);
      } catch (error) {
        console.error("Lỗi khi fetch tasks:", error);
        toast.error(tMessages("serverError"), { duration: 5000 });
      }
    };

    fetchTasks();
  }, [token, tMessages]);

  // Hàm cập nhật trạng thái task thành "review"
  const markCompleteToReview = async (taskId: string) => {
    if (!token) {
      toast.error(tMessages("noToken"));
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH", // Hoặc PUT tùy API của bạn
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "review" }), // Gửi trạng thái mới
      });

      if (!res.ok) {
        throw new Error("Không thể cập nhật trạng thái công việc");
      }

      // Cập nhật state local để hiển thị ngay mà không cần reload
      setData((prevData) =>
        prevData.map((task) =>
          task._id === taskId ? { ...task, status: "review" } : task
        )
      );

      toast.success(tMessages("updateSuccess"), { duration: 3000 });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error(tMessages("serverError"), { duration: 5000 });
    }
  };

  const statusOptions = {
    not_started: {
      label: t("statusOptions.not_started"),
      color: "bg-gray-200 text-gray-800",
    },
    in_progress: {
      label: t("statusOptions.in_progress"),
      color: "bg-yellow-200 text-yellow-800",
    },
    review: {
      label: t("statusOptions.review"),
      color: "bg-blue-200 text-blue-800",
    },
    completed: {
      label: t("statusOptions.completed"),
      color: "bg-green-200 text-green-800",
    },
  };

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "_id",
      header: t("id"),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: (info) => {
        const statusKey = info.getValue() as keyof typeof statusOptions;
        const status = statusOptions[statusKey];
        return (
          <span className={`px-2 py-1 rounded text-sm ${status.color}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }: { row: Row<Task> }) => (
        <div className="flex items-center gap-2">
          {/* Nút xem chi tiết với DialogTrigger */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setSelectedTask(row.original);
                  setIsDialogOpen(true);
                }}
                className="hover:bg-gray-100"
              >
                <Eye size={18} className="text-blue-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white rounded-lg shadow-lg p-6">
              {selectedTask && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-800 mb-4">
                      {t("taskDetails")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-8">
                    {/* Thông tin cơ bản */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                        {t("basicsInfo")}
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm flex items-center">
                          <strong className="text-gray-600 w-32">
                            {t("id")}:
                          </strong>
                          <span className="text-gray-800">
                            {selectedTask._id}
                          </span>
                        </p>
                        <p className="text-sm flex items-center">
                          <strong className="text-gray-600 w-32">
                            {t("name")}:
                          </strong>
                          <span className="text-gray-800">
                            {selectedTask.name}
                          </span>
                        </p>
                        <p className="text-sm flex items-start">
                          <strong className="text-gray-600 w-32">
                            {t("description")}:
                          </strong>
                          <span className="text-gray-800 flex-1">
                            {selectedTask.description || "Không có mô tả"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Thời gian */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                        {t("deadlineTime")}
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm flex items-center">
                          <strong className="text-gray-600 w-32">
                            {t("deadline")}:
                          </strong>
                          <span className="text-gray-800">
                            {new Date(selectedTask.deadline).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </p>
                        <p className="text-sm flex items-center">
                          <strong className="text-gray-600 w-32">
                            {t("assignedTime")}:
                          </strong>
                          <span className="text-gray-800">
                            {new Date(selectedTask.assignedTime).toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Người liên quan */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                        {t("relatedPerson")}
                      </h3>
                      <div className="space-y-3">
                        <p className="text-sm flex items-center">
                          <strong className="text-gray-600 w-32">
                            {t("assigner")}:
                          </strong>
                          <span className="text-gray-800">
                            {selectedTask.assigner?.username ||
                              "Không có assigner"}
                          </span>
                        </p>
                        <p className="text-sm flex items-center">
                          <strong className="text-gray-600 w-32">
                            {t("username")}:
                          </strong>
                          <span className="text-gray-800">
                            {selectedTask.userId.username}
                          </span>
                        </p>
                        <p className="text-sm flex items-center">
                          <strong className="text-gray-600 w-32">
                            {t("projectName")}:
                          </strong>
                          <span className="text-gray-800">
                            {selectedTask.projectId.projectName}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Trạng thái */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                        {t("status")}
                      </h3>
                      <p className="text-sm flex items-center">
                        <strong className="text-gray-600 w-32">
                          {t("status")}:
                        </strong>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            statusOptions[selectedTask.status].color
                          }`}
                        >
                          {statusOptions[selectedTask.status].label}
                        </span>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* DropdownMenu cho các hành động khác */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="hover:bg-gray-100">
                <MoreVertical size={18} className="text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {row.original.status === "in_progress" && (
                <DropdownMenuItem
                  onClick={() => markCompleteToReview(row.original._id)}
                >
                  {t("markReview")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => alert(`Hỗ trợ: ${row.original._id}`)}
              >
                {t("support")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <h1 className="font-bold text-2xl py-2">{t("title")}</h1>
      <div className="border rounded-lg shadow-sm p-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  {t("noData") || "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default TaskTable;
