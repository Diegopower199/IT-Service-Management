import type { TicketResponse } from "@/types/ticketTypes";
import styles from "../styles/dashboard.module.css";

interface DashboardRecentTicketsProps {
  tickets: TicketResponse[];
}

export default function DashboardRecentTickets({
  tickets,
}: DashboardRecentTicketsProps) {
  return (
    <section className={styles.recentTickets}>
      <h2 className={styles.sectionTitle}>Recent Tickets</h2>

      <table className={styles.ticketTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned</th>
            <th>Updated</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.idTicket}>
              <td className={styles.ticketId}>#{ticket.idTicket}</td>
              <td>{ticket.title}</td>
              <td>{ticket.status.name}</td>
              <td>{ticket.priority.name}</td>
              <td>{ticket.assignedTo?.username ?? "-"}</td>
              <td>{ticket.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
