import Button from "@/components/ui/Button";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";
import Link from "next/link";
import styles from "../styles/dashboard.module.css";

interface DashboardQuickActionsProps {
  role: UserRole;
}

export default function DashboardQuickActions({
  role,
}: DashboardQuickActionsProps) {
  if (role === USER_ROLES.USER) {
    return null;
  }

  if (role === USER_ROLES.TECHNICIAN) {
    return (
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button" variant="primary">
              Assign Ticket to Me
            </Button>
          </Link>
        </div>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button" variant="secondary">
              View Unassigned Tickets
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  if (role === USER_ROLES.ADMIN) {
    return (
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button" variant="primary">
              Assign Ticket
            </Button>
          </Link>
        </div>

        <div className={styles.quickActionsLinks}>
          <Link href="/tickets">
            <Button type="button" variant="secondary">
              Reassign Ticket
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return null;
}
