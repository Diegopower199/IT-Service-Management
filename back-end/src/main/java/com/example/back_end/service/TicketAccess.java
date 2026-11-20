package com.example.back_end.service;

import org.springframework.security.access.AccessDeniedException;

import com.example.back_end.enums.RoleName;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;

final class TicketAccess {

    private TicketAccess() {
    }

    static boolean hasRole(UserModel user, RoleName role) {
        return role.name().equalsIgnoreCase(user.getRole().getName());
    }

    static boolean isAssignedTo(TicketModel ticket, UserModel user) {
        return ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getIdUser().equals(user.getIdUser());
    }

    static void requireReadAccess(TicketModel ticket, UserModel user) {
        requireReadAccess(ticket, user, hasRole(user, RoleName.TECHNICIAN)
                ? "You cannot access tickets assigned to another technician"
                : "You do not have permission to access this ticket");
    }

    static void requireReadAccess(TicketModel ticket, UserModel user, String message) {
        if (hasRole(user, RoleName.ADMIN)) {
            return;
        }

        if (hasRole(user, RoleName.TECHNICIAN)
                && (ticket.getAssignedTo() == null || isAssignedTo(ticket, user))) {
            return;
        }

        if (hasRole(user, RoleName.USER)) {
            Long userId = user.getIdUser();
            boolean createdByUser = ticket.getCreatedBy().getIdUser().equals(userId);
            boolean requestedForUser = ticket.getRequestedFor().getIdUser().equals(userId);
            if (createdByUser || requestedForUser) {
                return;
            }
        }

        throw new AccessDeniedException(message);
    }
}
