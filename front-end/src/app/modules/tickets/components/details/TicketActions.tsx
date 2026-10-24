"use client";

import { useState } from "react";

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
}

export default function TicketActions({
  ticket,
  userRole,
  onEdit,
  onTicketUpdated,
}: TicketActionsProps) {
  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const [openChangePriority, setOpenChangePriority] = useState(false);
  const [openAddComment, setOpenAddComment] = useState(false);
  const [openAssignTechnician, setOpenAssignTechnician] = useState(false);

  const isTechnician = userRole === USER_ROLES.TECHNICIAN;

  const isAdmin = userRole === USER_ROLES.ADMIN;

  const isUser = userRole === USER_ROLES.USER;

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

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
        }}
      >
        <Typography variant="h6">Actions</Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {(isTechnician || isAdmin) && (
            <>
              <Button variant="contained" onClick={handleOpenAssignTechnician}>
                Assign Technician
              </Button>

              <Button variant="outlined" onClick={handleOpenChangeStatus}>
                Change Status
              </Button>

              <Button variant="outlined" onClick={handleOpenChangePriority}>
                Change Priority
              </Button>
            </>
          )}

          <Button variant="outlined" onClick={onEdit}>
            Edit Ticket
          </Button>

          <Button variant="outlined" onClick={handleOpenAddComment}>
            Add Comment
          </Button>
        </Stack>
      </Paper>

      <AssignTicketTechnicianDialog
        open={openAssignTechnician}
        ticketId={ticket.idTicket}
        currentTechnician={ticket.assignedTo}
        onClose={handleCloseAssignTechnician}
        onTicketUpdated={onTicketUpdated}
      />

      <ChangeTicketStatusDialog
        open={openChangeStatus}
        ticketId={ticket.idTicket}
        currentStatus={ticket.status}
        onClose={handleCloseChangeStatus}
        onTicketUpdated={onTicketUpdated}
      />

      <ChangeTicketPriorityDialog
        open={openChangePriority}
        ticketId={ticket.idTicket}
        currentPriority={ticket.priority}
        onClose={handleCloseChangePriority}
        onTicketUpdated={onTicketUpdated}
      />

      <AddTicketCommentDialog
        open={openAddComment}
        ticketId={ticket.idTicket}
        onClose={handleCloseAddComment}
        onCommentCreated={onTicketUpdated}
        onTicketUpdated={onTicketUpdated}
      />
    </>
  );
}
