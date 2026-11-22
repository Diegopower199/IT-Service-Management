"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import ConfirmationNumberOutlined from "@mui/icons-material/ConfirmationNumberOutlined";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import RuleOutlined from "@mui/icons-material/RuleOutlined";

import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/types/roleTypes";

import styles from "./appSidebar.module.css";

const navigationItems = [
  { href: "/dashboard", label: "dashboard", icon: GridViewOutlined },
  { href: "/tickets", label: "tickets", icon: ConfirmationNumberOutlined },
  { href: "/users", label: "users", icon: GroupsOutlined, adminOnly: true },
  { href: "/departments", label: "departments", icon: ApartmentOutlined, adminOnly: true },
  { href: "/categories", label: "categories", icon: CategoryOutlined, adminOnly: true },
  { href: "/priorities", label: "priorities", icon: FlagOutlined, adminOnly: true },
  { href: "/statuses", label: "statuses", icon: RuleOutlined, adminOnly: true },
  { href: "/roles", label: "roles", icon: AdminPanelSettingsOutlined, adminOnly: true },
  { href: "/profile", label: "profile", icon: PersonOutlineRounded },
] as const;

export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("Navigation.Sidebar");

  if (!user) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navigation}>
        {navigationItems
          .filter((item) => !("adminOnly" in item) || user.role === USER_ROLES.ADMIN)
          .map(({ href, label, icon: Icon }) => {
            const isCurrentPage = pathname === href;
            const isChildPage = pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isCurrentPage ? "page" : isChildPage ? "location" : undefined}
              >
                <Icon aria-hidden="true" fontSize="small" />
                <span>{t(label)}</span>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
