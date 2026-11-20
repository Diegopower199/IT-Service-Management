"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button, Paper } from "@mui/material";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import SwapHorizRounded from "@mui/icons-material/SwapHorizRounded";

import type { TicketResponse } from "@/types/ticketTypes";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";

import ChangeTicketStatusDialog from "../actions/ChangeTicketStatusDialog";
import ChangeTicketPriorityDialog from "../actions/ChangeTicketPriorityDialog";
import AddTicketCommentDialog from "../actions/AddTicketCommentDialog";
import AssignTicketTechnicianDialog from "../actions/AssignTicketTechnicianDialog";

import sharedStyles from "../../styles/tickets.module.css";
import styles from "../../styles/ticketDetails.module.css";

interface TicketActionsProps {
  ticket: TicketResponse;
  userRole: UserRole;
  onEdit: () => void;
  onTicketUpdated: () => void;
  onCommentsUpdated: () => void;
  onHistoryUpdated: () => void;
}

export default function TicketActions({
  ticket,
  userRole,
  onEdit,
  onTicketUpdated,
  onCommentsUpdated,
  onHistoryUpdated,
}: TicketActionsProps) {
  const t = useTranslations("Tickets.Actions");

  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const [openChangePriority, setOpenChangePriority] = useState(false);
  const [openAddComment, setOpenAddComment] = useState(false);
  const [openAssignTechnician, setOpenAssignTechnician] = useState(false);

  const isTechnician = userRole === USER_ROLES.TECHNICIAN;
  const isAdmin = userRole === USER_ROLES.ADMIN;

  const handleOpenChangeStatus = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    setOpenChangeStatus(true);
  };

  const handleOpenChangePriority = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    setOpenChangePriority(true);
  };

  const handleOpenAddComment = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    setOpenAddComment(true);
  };

  const handleOpenAssignTechnician = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    setOpenAssignTechnician(true);
  };

  const handleCloseChangeStatus = () => {
    setOpenChangeStatus(false);
  };

  const handleCloseChangePriority = () => {
    setOpenChangePriority(false);
  };

  const handleCloseAddComment = () => {
    setOpenAddComment(false);
  };

  const handleCloseAssignTechnician = () => {
    setOpenAssignTechnician(false);
  };

  const handleTicketAndHistoryUpdated = () => {
    onTicketUpdated();
    onHistoryUpdated();
  };

  return (
    <>
      <Paper component="section" variant="outlined" className={styles.panel}>
        <h2 className={styles.panelTitle}>
          <SwapHorizRounded aria-hidden="true" />
          {t("title")}
        </h2>

        <div className={styles.actionList}>
          {(isTechnician || isAdmin) && (
            <>
              <Button
                variant="contained"
                disableElevation
                startIcon={<AssignmentIndOutlined />}
                className={sharedStyles.primaryButton}
                onClick={handleOpenAssignTechnician}
              >
                {t("assignTechnician")}
              </Button>

              <Button
                variant="outlined"
                startIcon={<SwapHorizRounded />}
                className={sharedStyles.secondaryButton}
                onClick={handleOpenChangeStatus}
              >
                {t("changeStatus")}
              </Button>

              <Button
                variant="outlined"
                startIcon={<FlagOutlined />}
                className={sharedStyles.secondaryButton}
                onClick={handleOpenChangePriority}
              >
                {t("changePriority")}
              </Button>
            </>
          )}

          <Button
            variant="outlined"
            startIcon={<EditOutlined />}
            className={sharedStyles.secondaryButton}
            onClick={onEdit}
          >
            {t("editTicket")}
          </Button>

          <Button
            variant="outlined"
            startIcon={<ChatBubbleOutlineRounded />}
            className={sharedStyles.secondaryButton}
            onClick={handleOpenAddComment}
          >
            {t("addComment")}
          </Button>
        </div>
      </Paper>

      <AssignTicketTechnicianDialog
        open={openAssignTechnician}
        ticketId={ticket.idTicket}
        currentTechnician={ticket.assignedTo}
        onClose={handleCloseAssignTechnician}
        onTicketUpdated={handleTicketAndHistoryUpdated}
      />

      <ChangeTicketStatusDialog
        open={openChangeStatus}
        ticketId={ticket.idTicket}
        currentStatus={ticket.status}
        onClose={handleCloseChangeStatus}
        onTicketUpdated={handleTicketAndHistoryUpdated}
      />

      <ChangeTicketPriorityDialog
        open={openChangePriority}
        ticketId={ticket.idTicket}
        currentPriority={ticket.priority}
        onClose={handleCloseChangePriority}
        onTicketUpdated={handleTicketAndHistoryUpdated}
      />

      <AddTicketCommentDialog
        open={openAddComment}
        ticketId={ticket.idTicket}
        onClose={handleCloseAddComment}
        onCommentsUpdated={onCommentsUpdated}
      />
    </>
  );
}
