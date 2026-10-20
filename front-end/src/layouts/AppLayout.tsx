import type { ReactNode } from "react";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

import styles from "./appLayout.module.css";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.app}>
      <AppHeader />

      <div className={styles.body}>
        <AppSidebar />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
