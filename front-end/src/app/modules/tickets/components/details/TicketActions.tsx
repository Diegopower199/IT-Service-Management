"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button, Divider, Paper, Stack, Typography } from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";

import ChangeTicketStatusDialog from "../actions/ChangeTicketStatusDialog";
import ChangeTicketPriorityDialog from "../actions/ChangeTicketPriorityDialog";
import AddTicketCommentDialog from "../actions/AddTicketCommentDialog";
import AssignTicketTechnicianDialog from "../actions/AssignTicketTechnicianDialog";

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
      <Paper
        variant="outlined"
        sx={{
          p: 3,
        }}
      >
        <Typography variant="h6">{t("title")}</Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {(isTechnician || isAdmin) && (
            <>
              <Button variant="contained" onClick={handleOpenAssignTechnician}>
                {t("assignTechnician")}
              </Button>

              <Button variant="outlined" onClick={handleOpenChangeStatus}>
                {t("changeStatus")}
              </Button>

              <Button variant="outlined" onClick={handleOpenChangePriority}>
                {t("changePriority")}
              </Button>
            </>
          )}

          <Button variant="outlined" onClick={onEdit}>
            {t("editTicket")}
          </Button>

          <Button variant="outlined" onClick={handleOpenAddComment}>
            {t("addComment")}
          </Button>
        </Stack>
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
