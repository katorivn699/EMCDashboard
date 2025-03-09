"use client";

import React, { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { MoreVertical } from "lucide-react";
import { project } from "@/types/interfaces";
import { getCookie } from "@/lib/utils";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

// Định nghĩa interface cho payload của JWT
interface JwtPayload {
  role: string;
  [key: string]: unknown;
}

const ProjectsPage = () => {
  const tProjects = useTranslations("projects");
  const tMessages = useTranslations("messages");
  const [data, setData] = useState<project[]>([]);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const token = getCookie("auth_token");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) {
        toast.error(tMessages("noToken"));
        return;
      }
      try {
        const res = await fetch("/api/projects", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Không thể tải danh sách dự án");

        const resp = await res.json();
        setData(resp.data);
      } catch (error) {
        console.log(error);
        toast.error(tMessages("serverError"));
      }
    };

    fetchProjects();
  }, [token, tMessages]); // Thêm token và tMessages vào dependencies

  // Kiểm tra token trước khi decode
  const userRole = token ? jwtDecode<JwtPayload>(token).role : "member";

  const columns: ColumnDef<project>[] = [
    {
      accessorKey: "projectName",
      header: tProjects("projectName"),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "description",
      header: tProjects("description"),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "createdAt",
      header: tProjects("createdAt"),
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
    },
    ...(userRole === "admin" || userRole === "manager"
      ? [
          {
            id: "actions",
            header: tProjects("actions"),
            cell: ({ row }: { row: Row<project> }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleUpdate(row.original)}>
                    {tProjects("update")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(row.original._id)}>
                    {tProjects("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCreate = () => {
    setProjectName("");
    setDescription("");
    setOpenCreateDialog(true);
  };

  const handleSaveCreate = async () => {
    if (!token) {
      toast.error(tMessages("noToken"));
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectName,
          description,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(tMessages(result.message) || tMessages("defaultError"), {
          duration: 5000,
        });
        return;
      }

      setData((prev) => [...prev, result.data]);
      setOpenCreateDialog(false);
      toast.success(tMessages("createSuccess"), { duration: 5000 });
    } catch (error) {
      console.error("Lỗi khi tạo:", error);
      toast.error(tMessages("defaultError"), { duration: 5000 });
    }
  };

  const handleUpdate = (project: project) => {
    setSelectedProject(project);
    setProjectName(project.projectName);
    setDescription(project.description);
    setOpenUpdateDialog(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedProject || !token) {
      toast.error(tMessages("noToken"));
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: selectedProject._id,
          projectName,
          description,
        }),
      });

      const updatedData = await res.json();

      if (!res.ok) {
        toast.error(tMessages(updatedData.message) || tMessages("defaultError"), {
          duration: 5000,
        });
        return;
      }

      setData((prev) =>
        prev.map((proj) =>
          proj._id === selectedProject._id ? updatedData.data : proj
        )
      );
      setOpenUpdateDialog(false);
      setSelectedProject(null);
      toast.success(tMessages("saveSuccess"), { duration: 5000 });
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error(tMessages("defaultError"), { duration: 5000 });
    }
  };

  const handleDelete = async (id: string) => { // Thay number thành string
    if (!token) {
      toast.error(tMessages("noToken"));
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id: id }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(tMessages(result.message) || tMessages("defaultError"), {
          duration: 5000,
        });
        return;
      }

      setData((prev) => prev.filter((project) => project._id !== id));
      toast.success(tMessages("deleteSuccess"), { duration: 5000 });
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error(tMessages("defaultError"), { duration: 5000 });
    }
  };

  return (
    <div className="p-5">
      <Card className="w-full mx-auto mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tProjects("title")}</CardTitle>
          {(userRole === "admin" || userRole === "manager") && (
            <Button onClick={handleCreate}>{tProjects("create")}</Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-base font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
                      <TableCell key={cell.id} className="py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-4">
                    {tProjects("noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog để tạo dự án */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tProjects("create")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="text-right">
                {tProjects("projectName")}
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {tProjects("description")}
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>
              {tProjects("cancel")}
            </Button>
            <Button onClick={handleSaveCreate}>{tProjects("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog để cập nhật dự án */}
      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tProjects("updateProject")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="text-right">
                {tProjects("projectName")}
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {tProjects("description")}
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenUpdateDialog(false)}>
              {tProjects("cancel")}
            </Button>
            <Button onClick={handleSaveUpdate}>{tProjects("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;