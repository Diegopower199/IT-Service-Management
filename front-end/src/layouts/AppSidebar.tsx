"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/types/roleTypes";

import styles from "./appSidebar.module.css";

export default function AppSidebar() {
  const { user } = useAuth();

  const t = useTranslations("Navigation.Sidebar");

  if (!user) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navigation}>
        <Link href="/dashboard">{t("dashboard")}</Link>

        <Link href="/tickets">{t("tickets")}</Link>

        {user.role === USER_ROLES.ADMIN && (
          <>
            <Link href="/users">{t("users")}</Link>
            <Link href="/departments">{t("departments")}</Link>
            <Link href="/categories">{t("categories")}</Link>
            <Link href="/priorities">{t("priorities")}</Link>
            <Link href="/statuses">{t("statuses")}</Link>
            <Link href="/roles">{t("roles")}</Link>
          </>
        )}

        <Link href="/profile">{t("profile")}</Link>
      </nav>
    </aside>
  );
}
