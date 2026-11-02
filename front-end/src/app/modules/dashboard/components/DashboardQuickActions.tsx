"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";

import { USER_ROLES, type UserRole } from "@/types/roleTypes";

import styles from "../styles/dashboard.module.css";

interface DashboardQuickActionsProps {
  role: UserRole;
}

export default function DashboardQuickActions({
  role,
}: DashboardQuickActionsProps) {
  const t = useTranslations("Dashboard.QuickActions");

  if (role === USER_ROLES.USER) {
    return null;
  }

  if (role === USER_ROLES.TECHNICIAN) {
    return (
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>{t("title")}</h2>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button" variant="primary">
              {t("assignToMe")}
            </Button>
          </Link>
        </div>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button" variant="secondary">
              {t("viewUnassigned")}
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  if (role === USER_ROLES.ADMIN) {
    return (
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>{t("title")}</h2>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button" variant="primary">
              {t("assign")}
            </Button>
          </Link>
        </div>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button" variant="secondary">
              {t("reassign")}
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return null;
}
