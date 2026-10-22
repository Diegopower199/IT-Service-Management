import DashboardTicketStatisticCard from "./DashboardTicketStatisticCard";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";
import styles from "../styles/dashboard.module.css";
import { TicketStatisticsResponse } from "@/types/ticketTypes";

interface DashboardTicketStatisticsProps {
  rol: UserRole;
  statistics: TicketStatisticsResponse;
}

export default function DashboardTicketStatistics({
  rol,
  statistics,
}: DashboardTicketStatisticsProps) {
  const { totalTickets, openTickets, inProgressTickets, criticalTickets } =
    statistics;

  if (rol === USER_ROLES.USER) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard
          title="My Tickets"
          value={totalTickets}
          href="/tickets"
        />

        <DashboardTicketStatisticCard
          title="Open"
          value={openTickets}
          href="tickets?status=OPEN"
        />

        <DashboardTicketStatisticCard
          title="In Progress"
          value={inProgressTickets}
          href="/tickets?status=IN_PROGRESS"
        />

        <DashboardTicketStatisticCard
          title="Critical"
          value={criticalTickets}
          href="/tickets?priority=CRITICAL"
        />
      </section>
    );
  }

  if (rol === USER_ROLES.TECHNICIAN) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard
          title="Assigned Tickets"
          value={totalTickets}
          href="/tickets"
        />

        <DashboardTicketStatisticCard
          title="Open"
          value={openTickets}
          href="tickets?status=OPEN"
        />

        <DashboardTicketStatisticCard
          title="In Progress"
          value={inProgressTickets}
          href="/tickets?status=IN_PROGRESS"
        />

        <DashboardTicketStatisticCard
          title="Critical"
          value={criticalTickets}
          href="/tickets?priority=CRITICAL"
        />
      </section>
    );
  }

  if (rol === USER_ROLES.ADMIN) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard
          title="Total Tickets"
          value={totalTickets}
          href="/tickets"
        />

        <DashboardTicketStatisticCard
          title="Open"
          value={openTickets}
          href="tickets?status=OPEN"
        />

        <DashboardTicketStatisticCard
          title="In Progress"
          value={inProgressTickets}
          href="/tickets?status=IN_PROGRESS"
        />

        <DashboardTicketStatisticCard
          title="Critical"
          value={criticalTickets}
          href="/tickets?priority=CRITICAL"
        />
      </section>
    );
  }

  return null;
}
