"use client";

import { Button, Divider, Paper, Stack, Typography } from "@mui/material";

import type { TicketResponse } from "@/types/ticketTypes";
import { USER_ROLES, type UserRole } from "@/types/roleTypes";

interface TicketActionsProps {
  ticket: TicketResponse;
  userRole: UserRole;
  onEdit: () => void;
}

export default function TicketActions({
  ticket,
  userRole,
  onEdit,
}: TicketActionsProps) {
  const isTechnician = userRole === USER_ROLES.TECHNICIAN;

  const isAdmin = userRole === USER_ROLES.ADMIN;

  const isUser = userRole === USER_ROLES.USER;

  return (
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

            <Button variant="outlined">Change Status</Button>

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
  );
}
