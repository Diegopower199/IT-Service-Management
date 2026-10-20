import Button from "@/components/ui/Button";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";
import Link from "next/link";
import styles from "../styles/dashboard.module.css";

interface DashboardQuickActionsProps {
  rol: UserRole;
}

export default function DashboardQuickActions({
  rol,
}: DashboardQuickActionsProps) {
  if (rol === USER_ROLES.USER) {
    return null;
  }

  if (rol === USER_ROLES.TECHNICIAN) {
    return (
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button">Assign Ticket to Me</Button>
          </Link>
        </div>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button">View Unassigned Tickets</Button>
          </Link>
        </div>
      </section>
    );
  }

  if (rol === USER_ROLES.ADMIN) {
    return (
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button">Assign Ticket</Button>
          </Link>
        </div>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button">Reassign Ticket</Button>
          </Link>
        </div>
      </section>
    );
  }

  return null;
}
