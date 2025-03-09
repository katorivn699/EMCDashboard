"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { getCookie } from "@/lib/utils";
import { toast } from "sonner";
import { verifyToken } from "@/lib/auth"; // Import verifyToken

interface IResource {
  resourceName: string;
  rarity: string;
  dropRate: number;
  baseValue: number;
}

interface IMine {
  mineId: string;
  mineName: string;
  mineDurability: number;
  resources: IResource[];
  createAt: string;
  lastReset?: string;
}

export default function MinePage() {
  const t = useTranslations("mines");
  const tMess = useTranslations("messages");
  const [mines, setMines] = useState<IMine[]>([]);
  const [newMine, setNewMine] = useState({
    mineId: "",
    mineName: "",
    mineDurability: 0,
  });
  const [isOpen, setIsOpen] = useState(false);
  const token = getCookie("auth_token");
  const [isAdmin, setIsAdmin] = useState(false); // State để kiểm tra vai trò

  useEffect(() => {
    fetchMines();
    // Kiểm tra vai trò khi component mount
    if (token) {
      try {
        const decoded = verifyToken(token);
        setIsAdmin(decoded.role === "admin"); // Giả định token chứa role
      } catch (err) {
        console.error("Error verifying token:", err);
        setIsAdmin(false);
      }
    }
  }, [token]);

  const fetchMines = async () => {
    try {
      const res = await fetch("/api/mines", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || "server_error";
        throw new Error(tMess(errorMessage));
      }
      const data = await res.json();
      setMines(data);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleAddMine = async () => {
    if (!isAdmin) {
      toast.error(tMess("unauthorized"));
      return;
    }

    try {
      const res = await fetch("/api/mines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMine),
      });
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || "server_error";
        throw new Error(tMess(errorMessage));
      }
      fetchMines();
      setNewMine({
        mineId: "",
        mineName: "",
        mineDurability: 0,
      });
      setIsOpen(false);
      toast.success(t("add_mine_success"));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteMine = async (mineId: string) => {
    if (!isAdmin) {
      toast.error(tMess("unauthorized"));
      return;
    }

    try {
      const res = await fetch("/api/mines", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mineId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || "server_error";
        throw new Error(tMess(errorMessage));
      }
      fetchMines();
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

      {/* Chỉ hiển thị button thêm mỏ nếu là admin */}
      {isAdmin && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">
              <Plus className="mr-2 h-4 w-4" /> {t("add_mine")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("add_mine")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>{t("mine_id")}</Label>
                <Input
                  value={newMine.mineId}
                  onChange={(e) =>
                    setNewMine({ ...newMine, mineId: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("mine_name")}</Label>
                <Input
                  value={newMine.mineName}
                  onChange={(e) =>
                    setNewMine({ ...newMine, mineName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("durability")}</Label>
                <Input
                  type="number"
                  value={newMine.mineDurability}
                  onChange={(e) =>
                    setNewMine({
                      ...newMine,
                      mineDurability: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <p className="text-sm text-gray-500">{t("random_resources")}</p>
              <Button onClick={handleAddMine}>{t("save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("mine_id")}</TableHead>
            <TableHead>{t("mine_name")}</TableHead>
            <TableHead>{t("durability")}</TableHead>
            <TableHead>{t("resources")}</TableHead>
            {isAdmin && <TableHead>{t("actions")}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {mines.map((mine) => (
            <TableRow key={mine.mineId}>
              <TableCell>{mine.mineId}</TableCell>
              <TableCell>{mine.mineName}</TableCell>
              <TableCell>{mine.mineDurability}</TableCell>
              <TableCell>
                {mine.resources
                  .map((r) => `${r.resourceName} (${r.rarity}, ${r.dropRate}%)`)
                  .join(", ")}
              </TableCell>
              <TableCell>
                {/* Chỉ hiển thị action dropdown nếu là admin */}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteMine(mine.mineId)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
