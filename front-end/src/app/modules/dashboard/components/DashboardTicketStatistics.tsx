import DashboardTicketStatisticCard from "./DashboardTicketStatisticCard";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";
import styles from "../styles/dashboard.module.css";
import { TicketResponse } from "@/types/ticketTypes";

interface DashboardTicketStatisticsProps {
  rol: UserRole;
  tickets: TicketResponse[];
}

export default function DashboardTicketStatistics({
  rol,
  tickets,
}: DashboardTicketStatisticsProps) {
  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status.name === "OPEN",
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status.name === "IN_PROGRESS",
  ).length;

  const criticalTickets = tickets.filter(
    (ticket) => ticket.priority.name === "CRITICAL",
  ).length;

  if (rol === USER_ROLES.USER) {
    return (
      <section className={styles.statistics}>
        <DashboardTicketStatisticCard
          title="My Tickets"
          value={totalTickets}
          href=""
        />

        <DashboardTicketStatisticCard
          title="Open"
          value={openTickets}
          href=""
        />

        <DashboardTicketStatisticCard
          title="In Progress"
          value={inProgressTickets}
          href=""
        />

        <DashboardTicketStatisticCard
          title="Critical"
          value={criticalTickets}
          href=""
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
          href=""
        />

        <DashboardTicketStatisticCard
          title="Open"
          value={openTickets}
          href=""
        />

        <DashboardTicketStatisticCard
          title="In Progress"
          value={inProgressTickets}
          href=""
        />

        <DashboardTicketStatisticCard
          title="Critical"
          value={criticalTickets}
          href=""
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
          href=""
        />

        <DashboardTicketStatisticCard
          title="Open"
          value={openTickets}
          href=""
        />

        <DashboardTicketStatisticCard
          title="In Progress"
          value={inProgressTickets}
          href=""
        />

        <DashboardTicketStatisticCard
          title="Critical"
          value={criticalTickets}
          href=""
        />
      </section>
    );
  }

  return null;
}
