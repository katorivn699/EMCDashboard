"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations("about_page");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <Card className="max-w-2xl w-full shadow-xl bg-white rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-emerald-700">
            {t("introduction")}
          </CardTitle>
          <p className="text-gray-500 mt-2">{t("description")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Đặc điểm chính */}
          <div className="grid gap-4">
            <FeatureItem icon={<Users className="text-blue-500" />} title={t("feat_title_1")} description={t("feat_des_1")} />
            <FeatureItem icon={<CheckCircle className="text-green-500" />} title={t("feat_title_2")} description={t("feat_des_2")} />
            <FeatureItem icon={<Settings className="text-gray-700" />} title={t("feat_title_3")} description={t("feat_des_3")} />
          </div>

          {/* Hành động */}
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800">
                🚀 {t("start_now")}
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">
                📖 {t("docs")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Badge Footer */}
      <Badge className="mt-6 px-4 py-2 text-sm bg-gray-800 text-white">
        EMC - {t("smart_management")}
      </Badge>
    </div>
  );
}

// Component hiển thị mỗi tính năng
function FeatureItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-gray-200 rounded-full">{icon}</div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
