"use client";

import type { ComponentProps } from "react";

import PanelDialog from "@/components/ui/PanelDialog";

import styles from "../../styles/tickets.module.css";

type TicketDialogProps = Omit<ComponentProps<typeof PanelDialog>, "className">;

export default function TicketDialog(props: TicketDialogProps) {
  return <PanelDialog {...props} className={styles.dialog} />;
}
