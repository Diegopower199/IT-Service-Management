import Link from "next/link";
import styles from "../styles/dashboard.module.css";

interface DashboardTicketStatisticCardProps {
  title: string;
  value: number;
  href: string;
}

export default function DashboardTicketStatisticCard({
  title,
  value,
  href,
}: DashboardTicketStatisticCardProps) {
  return (
    <Link href={href} className={styles.statisticCard}>
      <h2 className={styles.statisticValue}>{value}</h2>

      <p className={styles.statisticTitle}>{title}</p>
    </Link>
  );
}
