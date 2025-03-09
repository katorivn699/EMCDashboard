"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCookie } from "@/lib/utils";
import Image from "next/image";
import bg from "@/assets/images/bg.png";
import pickaxe from "@/assets/images/cup.png";
import { useTranslations } from "next-intl"; // Import useTranslations

interface Mine {
  _id: string;
  mineName: string;
  mineDurability: number;
}

interface Item {
  _id: string;
  itemId: string;
  currentDurability: number;
  name?: string;
}

interface Resource {
  resourceName: string;
  quantity: number;
}

export default function MiningGame() {
  const t = useTranslations("miningGame"); // Sử dụng hook để lấy chuỗi dịch
  const [mines, setMines] = useState<Mine[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [inventory, setInventory] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [collectedResources, setCollectedResources] = useState<
    { resourceName: string; quantity: number }[]
  >([]);
  const token = getCookie("auth_token");

  // Fetch danh sách mỏ từ /api/mines
  useEffect(() => {
    const fetchMines = async () => {
      try {
        const res = await fetch("/api/mines", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(t("error"));
        const data = await res.json();
        const minesData = Array.isArray(data) ? data : data.data || [];
        setMines(minesData);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    if (token) fetchMines();
  }, [token, t]);

  // Fetch kho tài nguyên và công cụ từ /api/inventory
  useEffect(() => {
    const fetchInventory = async () => {
      if (!token) {
        setError(t("loginRequired"));
        return;
      }
      try {
        const res = await fetch("/api/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(t("error"));
        const data = await res.json();
        const inventoryData = data.data || {};
        setInventory(inventoryData.resources || []);
        setItems(inventoryData.tools || []);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchInventory();
  }, [token, t]);

  // Hàm xử lý đào bằng /api/mining với delay
  const handleMine = async () => {
    if (!selectedMine || !selectedItem || !token) {
      setError(t("selectMineItem"));
      return;
    }

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mining", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mineId: selectedMine._id,
          itemId: selectedItem._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("error"));
      }

      // Cập nhật mỏ
      setMines((prev) =>
        prev.map((m) =>
          m._id === selectedMine._id
            ? { ...m, mineDurability: data.data.mineDurability }
            : m
        )
      );

      // Cập nhật công cụ
      setItems((prev) =>
        prev.map((i) =>
          i._id === selectedItem._id
            ? { ...i, currentDurability: data.data.itemDurability }
            : i
        )
      );
      setSelectedItem((prev) =>
        prev ? { ...prev, currentDurability: data.data.itemDurability } : null
      );

      // Cập nhật kho tài nguyên và hiển thị dialog nếu có collectedResources
      if (data.data.collectedResources.length > 0) {
        setCollectedResources(data.data.collectedResources);
        setShowResourceDialog(true);
      }

      // Cập nhật kho tài nguyên
      const inventoryRes = await fetch("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const inventoryData = await inventoryRes.json();
      setInventory(inventoryData.data.resources || []);
      setItems(inventoryData.data.tools || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{
        backgroundImage: `url(${bg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card className="w-full max-w-3xl shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Danh sách mỏ */}
          <div>
            <h2 className="text-base font-semibold mb-2">{t("chooseMine")}</h2>
            <div className="flex flex-wrap gap-2">
              {mines.length > 0 ? (
                mines.map((mine) => (
                  <Button
                    key={mine._id}
                    onClick={() => setSelectedMine(mine)}
                    variant={
                      selectedMine?._id === mine._id ? "default" : "outline"
                    }
                    disabled={mine.mineDurability <= 0}
                    className="flex-1 min-w-[100px] text-sm"
                  >
                    {mine.mineName} ({mine.mineDurability})
                  </Button>
                ))
              ) : (
                <p className="text-sm">{t("noMines")}</p>
              )}
            </div>
          </div>

          {/* Danh sách công cụ */}
          <div>
            <h2 className="text-base font-semibold mb-2">{t("chooseTool")}</h2>
            <div className="flex flex-wrap gap-2">
              {items.length > 0 ? (
                items.map((item) => (
                  <Button
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    variant={
                      selectedItem?._id === item._id ? "default" : "outline"
                    }
                    disabled={item.currentDurability <= 0}
                    className="flex-1 min-w-[100px] text-sm"
                  >
                    {item.name || item.itemId} ({item.currentDurability})
                  </Button>
                ))
              ) : (
                <p className="text-sm">{t("noTools")}</p>
              )}
            </div>
          </div>

          {/* Nút đào với hình cái cuốc */}
          <div className="w-full flex justify-center">
            <button
              onClick={handleMine}
              disabled={loading || !selectedMine || !selectedItem || !token}
              className="relative disabled:opacity-50 transition-transform duration-200"
              onAnimationEnd={() => {
                (document.querySelector(".pickaxe") as HTMLButtonElement).style.animation = "none";
                void (document.querySelector(".pickaxe") as HTMLButtonElement).offsetWidth;
                (document.querySelector(".pickaxe") as HTMLButtonElement).style.animation = "";
              }}
            >
              <Image
                src={pickaxe}
                alt="Mine Now"
                width={80}
                height={80}
                className={`pickaxe ${loading ? "animate-pulse" : ""} ${
                  !loading && "hover:animate-shake"
                }`}
              />
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                  {t("mining")}
                </span>
              )}
            </button>
          </div>

          {/* Alert Dialog cho lỗi */}
          <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("error")}</AlertDialogTitle>
                <AlertDialogDescription>{error}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setError(null)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Alert Dialog cho tài nguyên thu thập */}
          <AlertDialog
            open={showResourceDialog}
            onOpenChange={setShowResourceDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("resourcesCollected")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {collectedResources.length > 0 ? (
                    <ul>
                      {collectedResources.map((res, index) => (
                        <li key={index}>
                          {res.resourceName}: {res.quantity}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    t("noResources")
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowResourceDialog(false)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Hiển thị kho tài nguyên */}
          {inventory.length > 0 ? (
            <div>
              <h2 className="text-base font-semibold mb-2">{t("inventory")}</h2>
              <div className="grid grid-cols-2 gap-2">
                {inventory.map((res) => (
                  <Card key={res.resourceName} className="p-2 bg-gray-50">
                    <p className="text-sm font-medium">{res.resourceName}</p>
                    <p className="text-xs">Quantity: {res.quantity}</p>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm">{t("noInventory")}</p>
          )}
        </CardContent>
      </Card>

      {/* CSS cho hiệu ứng đập */}
      <style jsx>{`
        @keyframes shake {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-5px, -5px) rotate(-5deg); }
          50% { transform: translate(5px, 5px) rotate(5deg); }
          75% { transform: translate(-5px, -5px) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-pulse {
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}