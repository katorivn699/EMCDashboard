"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl"; // Import useTranslations
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCookie } from "@/lib/utils";

interface Item {
  _id: string;
  name: string;
  description: string;
  strength: number;
  rarity: string;
  sellValue: number;
  durability: number;
}

interface UserCreditData {
  eCredit: number;
  achievements: string[];
}

export default function ShopPage() {
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [user, setUser] = useState<UserCreditData | null>(null);
  const [loading, setLoading] = useState(false);
  const token = getCookie("auth_token");
  const router = useRouter();
  const t = useTranslations("Shop"); // Lấy translations cho namespace "ShopPage"

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/minishop/items", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(t("fetchItemsError"));
        const data = await res.json();
        setShopItems(data.data);
      } catch (err) {
        toast.error((err as Error).message);
      }
    };
    fetchItems();
  }, [t]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        toast.error(t("loginError"));
        return;
      }
      try {
        const res = await fetch("/api/user/get-credit", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          if (data.message === "Please verify your Discord account") {
            toast.warning(t("verifyDiscord"), {
              description: t("verifyDiscordDesc"),
              action: {
                label: t("homeButton"),
                onClick: () => router.push("/"),
              },
            });
            setTimeout(() => router.push("/"), 2000);
          } else {
            throw new Error(data.message || t("fetchUserError"));
          }
          return;
        }

        setUser(data.data);
      } catch (err) {
        toast.error((err as Error).message);
      }
    };
    fetchUserData();
  }, [token, router, t]);

  const handleBuyItem = async (itemId: string) => {
    if (!token) {
      toast.error(t("loginToBuyError"));
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/minishop/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || t("buyError"));

      setUser((prev) =>
        prev ? { ...prev, eCredit: data.data.eCredit } : null
      );
      toast.success(t("buySuccess", { eCredit: data.data.eCredit }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="w-full mx-auto">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="text-3xl font-bold">{t("title")}</CardTitle>
          {user && (
            <p className="text-lg">{t("balance", { eCredit: user.eCredit })}</p>
          )}
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {shopItems.map((item) => (
              <Card
                key={item._id}
                className="w-full p-6 bg-gray-50 hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-2xl mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-lg">{item.description}</p>
                  <p className="text-lg">Strength: {item.strength}</p>
                  <p className="text-lg">Rarity: {item.rarity}</p>
                  <p className="text-lg font-medium">
                    Cost: {item.sellValue} eCredit
                  </p>
                  <p className="text-lg">Durability: {item.durability}</p>
                </div>
                <Button
                  onClick={() => handleBuyItem(item._id)}
                  disabled={loading || !user || user.eCredit < item.sellValue}
                  className="mt-4 md:mt-0 md:ml-6 w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-lg py-6 px-8"
                >
                  {user && user.eCredit < item.sellValue
                    ? t("notEnoughECredit")
                    : t("buy")}
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-8 text-lg">
            {t("purchaseGuide")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
