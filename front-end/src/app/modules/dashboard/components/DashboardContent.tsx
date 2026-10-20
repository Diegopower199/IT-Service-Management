"use client";

import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "./DashboardHeader";
import DashboardTicketStatistics from "./DashboardTicketStatistics";
import DashboardRecentTickets from "./DashboardRecentTickets";
import DashboardQuickActions from "./DashboardQuickActions";
import styles from "../styles/dashboard.module.css";

export default function DashboardContent() {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>Dashboard</h1>

      {user && (
        <>
          <DashboardHeader username={user.username} rol={user.rol} />

          <DashboardTicketStatistics rol={user.rol} />

          <div className={styles.dashboardBottom}>
            <DashboardRecentTickets tickets={[]} />
            <DashboardQuickActions rol={user.rol} />
          </div>
        </>
      )}
    </main>
  );
}
