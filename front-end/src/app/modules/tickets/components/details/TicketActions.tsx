"use client";

import { useState } from "react";

import { Button, Divider, Paper, Stack, Typography } from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";

import ChangeTicketStatusDialog from "../actions/ChangeTicketStatusDialog";

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

  const isTechnician = userRole === USER_ROLES.TECHNICIAN;

  const isAdmin = userRole === USER_ROLES.ADMIN;

  const isUser = userRole === USER_ROLES.USER;

  const handleOpenChangeStatus = () => {
    setOpenChangeStatus(true);
  };

  const handleCloseChangeStatus = () => {
    setOpenChangeStatus(false);
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
              <Button variant="contained">Assign Technician</Button>

              <Button variant="outlined" onClick={handleOpenChangeStatus}>
                Change Status
              </Button>

              <Button variant="outlined">Change Priority</Button>
            </>
          )}

          <Button variant="outlined" onClick={onEdit}>
            Edit Ticket
          </Button>

          {isUser && <Button variant="outlined">Add Public Comment</Button>}

          {(isTechnician || isAdmin) && (
            <Button variant="outlined">Add Internal Comment</Button>
          )}
        </Stack>
      </Paper>

      <ChangeTicketStatusDialog
        open={openChangeStatus}
        ticketId={ticket.idTicket}
        currentStatus={ticket.status}
        onClose={handleCloseChangeStatus}
        onTicketUpdated={onTicketUpdated}
      />
    </>
  );
}
