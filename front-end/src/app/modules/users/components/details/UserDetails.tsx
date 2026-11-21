"use client";

import { useTranslations } from "next-intl";
import { Button, Chip, Paper } from "@mui/material";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import RemoveCircleOutlineRounded from "@mui/icons-material/RemoveCircleOutlineRounded";

import { USER_ROLES } from "@/types/roleTypes";
import type { UserResponse } from "@/types/userTypes";
import sharedStyles from "@/app/modules/tickets/styles/tickets.module.css";
import detailStyles from "@/app/modules/tickets/styles/ticketDetails.module.css";
import styles from "../../styles/users.module.css";

interface UserDetailsProps {
  user: UserResponse;
  onClose: () => void;
}

export default function UserDetails({ user, onClose }: UserDetailsProps) {
  const t = useTranslations("Users.Details");
  const tForm = useTranslations("Users.Form");
  const tContent = useTranslations("Users.Content");
  const tRoles = useTranslations("Common.Roles");
  const roleName = user.role.name;
  const roleColor = roleName === USER_ROLES.ADMIN
    ? "primary"
    : roleName === USER_ROLES.TECHNICIAN ? "info" : "default";

  return (
    <div className={`${sharedStyles.page} ${styles.details}`}>
      <div>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onClose}
          className={sharedStyles.secondaryButton}
        >
          {tForm("back")}
        </Button>
      </div>

      <header className={detailStyles.hero}>
        <span className={sharedStyles.headingIcon} aria-hidden="true">
          <AccountCircleOutlined />
        </span>
        <div className={detailStyles.heroBody}>
          <div>
            <h1>
              <span className={detailStyles.ticketReference}>{tForm("viewTitle")}</span>
              {" "}
              {user.firstName} {user.lastName}
            </h1>
            <p className={styles.detailsUsername}>{user.username}</p>
          </div>
          <div className={detailStyles.badges}>
            <Chip
              size="small"
              color={roleColor}
              label={tRoles.has(roleName) ? tRoles(roleName) : roleName}
              className={sharedStyles.ticketBadge}
            />
            <Chip
              size="small"
              color={user.enabled ? "success" : "default"}
              icon={user.enabled ? <CheckCircleOutlineRounded /> : <RemoveCircleOutlineRounded />}
              label={user.enabled ? tContent("enabled") : tContent("disabled")}
              className={`${sharedStyles.ticketBadge} ${styles.statusBadge}`}
            />
          </div>
        </div>
      </header>

      <Paper
        component="section"
        variant="outlined"
        className={detailStyles.panel}
        aria-labelledby="user-account-information"
      >
        <h2 id="user-account-information" className={detailStyles.panelTitle}>
          <BadgeOutlined aria-hidden="true" />
          {t("accountInformation")}
        </h2>
        <dl className={`${detailStyles.metadata} ${styles.detailsMetadata}`}>
          <div className={detailStyles.metadataItem}>
            <dt>{tForm("email")}</dt>
            <dd>{user.email}</dd>
          </div>
          <div className={detailStyles.metadataItem}>
            <dt>{tForm("department")}</dt>
            <dd>{user.department?.name ?? t("noDepartment")}</dd>
          </div>
        </dl>
      </Paper>
    </div>
  );
}
