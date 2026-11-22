"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";
import FilterListRounded from "@mui/icons-material/FilterListRounded";
import SwapHorizRounded from "@mui/icons-material/SwapHorizRounded";

import { USER_ROLES, type UserRole } from "@/types/roleTypes";

import styles from "../styles/dashboard.module.css";

interface DashboardQuickActionsProps {
  role: UserRole;
}

export default function DashboardQuickActions({
  role,
}: DashboardQuickActionsProps) {
  const t = useTranslations("Dashboard.QuickActions");

  if (role !== USER_ROLES.ADMIN && role !== USER_ROLES.TECHNICIAN) {
    return null;
  }

  const isAdmin = role === USER_ROLES.ADMIN;
  const SecondaryIcon = isAdmin ? SwapHorizRounded : FilterListRounded;

  return (
    <section className={styles.quickActions} aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className={styles.sectionTitle}>
        {t("title")}
      </h2>

      <div className={styles.quickActionsLinks}>
        <Link href="/tickets" className={styles.primaryAction}>
          <AssignmentIndOutlined fontSize="small" aria-hidden="true" />
          <span>{t(isAdmin ? "assign" : "viewAssigned")}</span>
        </Link>
        <Link href="/tickets" className={styles.secondaryAction}>
          <SecondaryIcon fontSize="small" aria-hidden="true" />
          <span>{t(isAdmin ? "reassign" : "viewUnassigned")}</span>
        </Link>
      </div>
    </section>
  );
}
