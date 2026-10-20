"use client";

import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "./DashboardHeader";
import DashboardTicketStatistics from "./DashboardTicketStatistics";
import DashboardRecentTickets from "./DashboardRecentTickets";
import DashboardQuickActions from "./DashboardQuickActions";
import styles from "../styles/dashboard.module.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardContent() {
  const { user, isAuthReady } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/login");
    }
  }, [isAuthReady, user, router]);

  if (!isAuthReady || !user) {
    return <p>Loading...</p>;
  }

  return (
    <main>
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
