import DashboardTicketStatisticCard from "./DashboardTicketStatisticCard";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";
import styles from "../styles/dashboard.module.css";

interface DashboardTicketStatisticsProps {
  rol: UserRole;
}

export default function DashboardTicketStatistics({
  rol,
}: DashboardTicketStatisticsProps) {
  if (rol === USER_ROLES.USER) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard title="My Tickets" value={0} href="" />

        <DashboardTicketStatisticCard title="Open" value={0} href="" />

        <DashboardTicketStatisticCard title="In Progress" value={0} href="" />

        <DashboardTicketStatisticCard title="Critical" value={0} href="" />
      </section>
    );
  }

  if (rol === USER_ROLES.TECHNICIAN) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard
          title="Assigned Tickets"
          value={0}
          href=""
        />

        <DashboardTicketStatisticCard title="Open" value={0} href="" />

        <DashboardTicketStatisticCard title="In Progress" value={0} href="" />

        <DashboardTicketStatisticCard title="Critical" value={0} href="" />
      </section>
    );
  }

  if (rol === USER_ROLES.ADMIN) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard title="Total Tickets" value={0} href="" />

        <DashboardTicketStatisticCard title="Open" value={0} href="" />

        <DashboardTicketStatisticCard title="In Progress" value={0} href="" />

        <DashboardTicketStatisticCard title="Critical" value={0} href="" />
      </section>
    );
  }

  return null;
}
