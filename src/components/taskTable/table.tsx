"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { useTranslations } from "next-intl";
import { MoreVertical } from "lucide-react";

// 📝 Dữ liệu mẫu (status sử dụng key của `statusOptions`)
const tasks = [
  {
    id: 1,
    name: "Thiết kế UI",
    status: "in_progress",
    deadline: "2025-03-10",
    assignedTime: "2025-03-01",
    assigner: "Nguyễn Văn A",
  },
  {
    id: 2,
    name: "Viết tài liệu API",
    status: "completed",
    deadline: "2025-03-05",
    assignedTime: "2025-02-28",
    assigner: "Trần Thị B",
  },
  {
    id: 3,
    name: "Tích hợp WebSocket",
    status: "not_started",
    deadline: "2025-03-15",
    assignedTime: "2025-03-02",
    assigner: "Lê Văn C",
  },
  {
    id: 4,
    name: "Kiểm tra API",
    status: "review",
    deadline: "2025-03-20",
    assignedTime: "2025-03-03",
    assigner: "Phạm Thị D",
  },
];

const TaskTable = () => {
  const t = useTranslations("tasks");
  const [data] = useState(tasks);

  const statusOptions = {
    not_started: {
      label: t("statusOptions.not_started"),
      color: "bg-gray-100 text-gray-700",
    },
    in_progress: {
      label: t("statusOptions.in_progress"),
      color: "bg-yellow-100 text-yellow-700",
    },
    review: {
      label: t("statusOptions.review"),
      color: "bg-blue-100 text-blue-700",
    },
    completed: {
      label: t("statusOptions.completed"),
      color: "bg-green-100 text-green-700",
    },
  };

  const columns: ColumnDef<(typeof tasks)[number]>[] = [
    {
      accessorKey: "id", // Thêm cột id
      header: t("id"), // Đảm bảo thêm key "id" vào file translations
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "name",
      header: t("name"),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "deadline",
      header: t("deadline"),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "assignedTime",
      header: t("assignedTime"),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "assigner",
      header: t("assigner"),
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
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => alert(`Xem chi tiết: ${row.original.id}`)}
            >
              {t("viewDetails")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => alert(`Hoàn thành: ${row.original.id}`)}
            >
              {t("markComplete")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => alert(`Hỗ trợ: ${row.original.id}`)}
            >
              {t("support")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default TaskTable;