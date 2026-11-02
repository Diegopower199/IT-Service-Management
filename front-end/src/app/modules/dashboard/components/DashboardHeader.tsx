"use client";

import { useTranslations } from "next-intl";

interface DashboardHeaderProps {
  username: string;
  role: string;
}

export default function DashboardHeader({
  username,
  role,
}: DashboardHeaderProps) {
  const t = useTranslations("Dashboard.Header");

  const getDescription = () => {
    switch (role) {
      case "ADMIN":
        return t("adminDescription");

      case "TECHNICIAN":
        return t("technicianDescription");

      case "USER":
        return t("userDescription");

      default:
        return t("defaultDescription");
    }
  };

  return (
    <header>
      <h1>{t("welcome", { username })}</h1>

      <p>{getDescription()}</p>
    </header>
  );
}
