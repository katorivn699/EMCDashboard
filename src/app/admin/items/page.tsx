"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Thêm Select từ ShadCN
import { useTranslations } from "next-intl";
import { MoreVertical } from "lucide-react";
import { getCookie } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JwtPayload } from "@/types/interfaces";

interface MinigameItem {
  _id: string;
  itemId: string;
  name: string;
  description: string;
  strength: number;
  rarity: string;
  sellValue: number;
  durability: number;
}


// Danh sách độ hiếm cố định
const RARITY_OPTIONS = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
];

export default function AdminItemPage() {
  const tItems = useTranslations("items");
  const tMessages = useTranslations("messages");
  const [data, setData] = useState<MinigameItem[]>([]);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MinigameItem | null>(null);
  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [strength, setStrength] = useState(0);
  const [rarity, setRarity] = useState(RARITY_OPTIONS[0]); // Mặc định là "Common"
  const [sellValue, setSellValue] = useState(0);
  const [durability, setDurability] = useState(0);
  const token = getCookie("auth_token");

  // Fetch danh sách items
  useEffect(() => {
    const fetchItems = async () => {
      if (!token) {
        toast.error(tMessages("noToken"));
        return;
      }
      try {
        const res = await fetch("/api/minishop/items", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(tMessages("fetchError"));

        const resp = await res.json();
        setData(resp.data);
      } catch (error) {
        console.log(error);
        toast.error(tMessages("serverError"));
      }
    };

    fetchItems();
  }, [token, tMessages]);

  // Kiểm tra role từ token
  const userRole = token ? jwtDecode<JwtPayload>(token).role : "member";

  const handleCreate = () => {
    setItemId("");
    setName("");
    setDescription("");
    setStrength(0);
    setRarity(RARITY_OPTIONS[0]); // Reset về "Common"
    setSellValue(0);
    setDurability(0);
    setOpenCreateDialog(true);
  };

  const handleSaveCreate = async () => {
    if (!token) {
      toast.error(tMessages("noToken"));
      return;
    }
    try {
      const res = await fetch("/api/minishop/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId,
          name,
          description,
          strength,
          rarity,
          sellValue,
          durability,
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

  const handleUpdate = (item: MinigameItem) => {
    setSelectedItem(item);
    setItemId(item.itemId);
    setName(item.name);
    setDescription(item.description);
    setStrength(item.strength);
    setRarity(item.rarity);
    setSellValue(item.sellValue);
    setDurability(item.durability);
    setOpenUpdateDialog(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedItem || !token) {
      toast.error(tMessages("noToken"));
      return;
    }
    try {
      const res = await fetch(`/api/minishop/items/${selectedItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId,
          name,
          description,
          strength,
          rarity,
          sellValue,
          durability,
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
        prev.map((item) =>
          item._id === selectedItem._id ? updatedData.data : item
        )
      );
      setOpenUpdateDialog(false);
      setSelectedItem(null);
      toast.success(tMessages("updateSuccess"), { duration: 5000 });
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error(tMessages("defaultError"), { duration: 5000 });
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      toast.error(tMessages("noToken"));
      return;
    }
    try {
      const res = await fetch(`/api/minishop/items/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(tMessages(result.message) || tMessages("defaultError"), {
          duration: 5000,
        });
        return;
      }

      setData((prev) => prev.filter((item) => item._id !== id));
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
          <CardTitle>{tItems("title")}</CardTitle>
          {(userRole === "admin" || userRole === "manager") && (
            <Button onClick={handleCreate}>{tItems("create")}</Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-semibold">{tItems("itemId")}</TableHead>
                <TableHead className="text-base font-semibold">{tItems("name")}</TableHead>
                <TableHead className="text-base font-semibold">{tItems("description")}</TableHead>
                <TableHead className="text-base font-semibold">{tItems("strength")}</TableHead>
                <TableHead className="text-base font-semibold">{tItems("rarity")}</TableHead>
                <TableHead className="text-base font-semibold">{tItems("sellValue")}</TableHead>
                <TableHead className="text-base font-semibold">{tItems("durability")}</TableHead>
                {(userRole === "admin" || userRole === "manager") && (
                  <TableHead className="text-base font-semibold">{tItems("actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length ? (
                data.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="py-3 text-sm">{item.itemId}</TableCell>
                    <TableCell className="py-3 text-sm">{item.name}</TableCell>
                    <TableCell className="py-3 text-sm">{item.description}</TableCell>
                    <TableCell className="py-3 text-sm">{item.strength}</TableCell>
                    <TableCell className="py-3 text-sm">{item.rarity}</TableCell>
                    <TableCell className="py-3 text-sm">{item.sellValue}</TableCell>
                    <TableCell className="py-3 text-sm">{item.durability}</TableCell>
                    {(userRole === "admin" || userRole === "manager") && (
                      <TableCell className="py-3 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleUpdate(item)}>
                              {tItems("update")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item._id)}>
                              {tItems("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {tItems("noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog để tạo item */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tItems("create")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemId" className="text-right">{tItems("itemId")}</Label>
              <Input
                id="itemId"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{tItems("name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">{tItems("description")}</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="strength" className="text-right">{tItems("strength")}</Label>
              <Input
                id="strength"
                type="number"
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rarity" className="text-right">{tItems("rarity")}</Label>
              <Select value={rarity} onValueChange={setRarity}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={tItems("selectRarity")} />
                </SelectTrigger>
                <SelectContent>
                  {RARITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellValue" className="text-right">{tItems("sellValue")}</Label>
              <Input
                id="sellValue"
                type="number"
                value={sellValue}
                onChange={(e) => setSellValue(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="durability" className="text-right">{tItems("durability")}</Label>
              <Input
                id="durability"
                type="number"
                value={durability}
                onChange={(e) => setDurability(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>
              {tItems("cancel")}
            </Button>
            <Button onClick={handleSaveCreate}>{tItems("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog để cập nhật item */}
      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tItems("updateItem")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemId" className="text-right">{tItems("itemId")}</Label>
              <Input
                id="itemId"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{tItems("name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">{tItems("description")}</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="strength" className="text-right">{tItems("strength")}</Label>
              <Input
                id="strength"
                type="number"
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rarity" className="text-right">{tItems("rarity")}</Label>
              <Select value={rarity} onValueChange={setRarity}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={tItems("selectRarity")} />
                </SelectTrigger>
                <SelectContent>
                  {RARITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sellValue" className="text-right">{tItems("sellValue")}</Label>
              <Input
                id="sellValue"
                type="number"
                value={sellValue}
                onChange={(e) => setSellValue(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="durability" className="text-right">{tItems("durability")}</Label>
              <Input
                id="durability"
                type="number"
                value={durability}
                onChange={(e) => setDurability(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenUpdateDialog(false)}>
              {tItems("cancel")}
            </Button>
            <Button onClick={handleSaveUpdate}>{tItems("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}