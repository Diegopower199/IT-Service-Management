import Link from "next/link";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ConfirmationNumberOutlined from "@mui/icons-material/ConfirmationNumberOutlined";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import PendingActionsOutlined from "@mui/icons-material/PendingActionsOutlined";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";

import styles from "../styles/dashboard.module.css";

const statisticIcons = {
  total: ConfirmationNumberOutlined,
  open: RadioButtonUncheckedRounded,
  inProgress: PendingActionsOutlined,
  critical: ErrorOutlineRounded,
};

interface DashboardTicketStatisticCardProps {
  kind: keyof typeof statisticIcons;
  title: string;
  value: number;
  href: string;
}

export default function DashboardTicketStatisticCard({
  kind,
  title,
  value,
  href,
}: DashboardTicketStatisticCardProps) {
  const Icon = statisticIcons[kind];

  return (
    <Link href={href} className={styles.statisticCard}>
      <div className={styles.statisticCardTop}>
        <span className={styles.statisticIcon} data-kind={kind}>
          <Icon fontSize="small" aria-hidden="true" />
        </span>
        <ArrowForwardRounded
          className={styles.statisticArrow}
          fontSize="small"
          aria-hidden="true"
        />
      </div>
      <p className={styles.statisticValue}>{value}</p>
      <p className={styles.statisticTitle}>{title}</p>
    </Link>
  );
}
