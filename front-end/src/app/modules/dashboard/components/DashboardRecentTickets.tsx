import type { TicketSummary } from "@/types/ticketTypes";
import styles from "../styles/dashboard.module.css";

interface DashboardRecentTicketsProps {
  tickets: TicketSummary[];
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
            <tr key={ticket.id}>
              <td className={styles.ticketId}>#{ticket.id}</td>
              <td>{ticket.title}</td>
              <td>{ticket.status}</td>
              <td>{ticket.priority}</td>
              <td>{ticket.assignedTo ?? "-"}</td>
              <td>{ticket.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
