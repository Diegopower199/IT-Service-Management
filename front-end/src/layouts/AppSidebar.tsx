"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/types/roleTypes";

import styles from "./appSidebar.module.css";

export default function AppSidebar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navigation}>
        <Link href="/dashboard">Dashboard</Link>

        <Link href="/tickets">Tickets</Link>

        <Link href="/tickets/new">Create Ticket</Link>

        {user.rol === USER_ROLES.ADMIN && (
          <>
            <Link href="/users">Users</Link>
            <Link href="/departments">Departments</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/priorities">Priorities</Link>
            <Link href="/statuses">Statuses</Link>
            <Link href="/roles">Roles</Link>
          </>
        )}

        <Link href="/profile">Profile</Link>
      </nav>
    </aside>
  );
}
