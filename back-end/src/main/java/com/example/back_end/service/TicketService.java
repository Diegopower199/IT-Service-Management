package com.example.back_end.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.dtos.ticket.AssignTicketRequest;
import com.example.back_end.dtos.ticket.ChangePriorityRequest;
import com.example.back_end.dtos.ticket.ChangeStatusRequest;
import com.example.back_end.dtos.ticket.CreateTicketRequest;
import com.example.back_end.dtos.ticket.TicketResponse;
import com.example.back_end.dtos.ticket.TicketStatisticsResponse;
import com.example.back_end.dtos.ticket.UpdateTicketRequest;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.PriorityName;
import com.example.back_end.enums.RoleName;
import com.example.back_end.enums.StatusName;
import com.example.back_end.enums.TicketHistoryAction;
import com.example.back_end.exception.AccessDeniedException;
import com.example.back_end.exception.InvalidOperationException;
import com.example.back_end.exception.InvalidRoleException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.CategoryModel;
import com.example.back_end.model.PriorityModel;
import com.example.back_end.model.StatusModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.CategoryRepository;
import com.example.back_end.repository.PriorityRepository;
import com.example.back_end.repository.StatusRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PriorityRepository priorityRepository;
    private final StatusRepository statusRepository;

    private final TicketHistoryService ticketHistoryService;

    public Page<TicketResponse> getAllTickets(Pageable pageable) {

        Page<TicketModel> tickets = ticketRepository.findAll(pageable);

        return tickets.map(this::convertToResponse);
    }

    public TicketResponse getTicketById(Long ticketId) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        String role = currentUser.getRol().getName();

        if (role.equalsIgnoreCase(RoleName.USER.name())) {

            boolean isCreatedByUser = ticket.getCreatedBy().getIdUser().equals(currentUser.getIdUser());

            boolean isRequestedForUser = ticket.getRequestedFor().getIdUser().equals(currentUser.getIdUser());

            if (!isCreatedByUser && !isRequestedForUser) {
                throw new AccessDeniedException(
                        "You do not have permission to access this ticket");
            }
        }

        return convertToResponse(ticket);
    }

    public Page<TicketResponse> getMyTickets(Pageable pageable) {

        UserModel currentUser = getAuthenticatedUser();

        Page<TicketModel> tickets = ticketRepository.findByCreatedByOrRequestedFor(
                currentUser,
                currentUser, pageable);

        return tickets.map(this::convertToResponse);
    }

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {

        UserModel createdBy = getAuthenticatedUser();

        UserModel requestedFor = userRepository.findById(request.getRequestedForId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Requested user not found"));

        CategoryModel category = categoryRepository
                .findByIdCategoryAndActiveTrue(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active category with id " + request.getCategoryId() + " not found"));

        PriorityModel priority = priorityRepository
                .findByIdPriorityAndActiveTrue(request.getPriorityId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active priority with id " + request.getPriorityId() + " not found"));

        StatusModel status = statusRepository
                .findByNameAndActiveTrue(StatusName.OPEN.name())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active OPEN status not found"));

        TicketModel ticket = new TicketModel();

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());

        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setLastUpdated(now);

        ticket.setCreatedBy(createdBy);
        ticket.setRequestedFor(requestedFor);

        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        TicketModel savedTicket = ticketRepository.save(ticket);

        ticketHistoryService.createHistory(
                savedTicket,
                createdBy,
                TicketHistoryAction.TICKET_CREATED,
                null,
                null,
                null);

        return convertToResponse(savedTicket);
    }

    @Transactional
    public TicketResponse updateTicket(
            Long ticketId,
            UpdateTicketRequest request) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        String role = currentUser.getRol().getName();

        if (role.equalsIgnoreCase(RoleName.USER.name())) {

            boolean isCreatedByUser = ticket.getCreatedBy().getIdUser().equals(currentUser.getIdUser());

            boolean isRequestedForUser = ticket.getRequestedFor().getIdUser().equals(currentUser.getIdUser());

            if (!isCreatedByUser && !isRequestedForUser) {
                throw new AccessDeniedException(
                        "You do not have permission to access this ticket");
            }
        }

        if (role.equalsIgnoreCase(RoleName.TECHNICIAN.name())) {

            if (ticket.getAssignedTo() == null
                    || !ticket.getAssignedTo()
                            .getIdUser()
                            .equals(currentUser.getIdUser())) {

                throw new AccessDeniedException(
                        "You can only update tickets assigned to you");
            }
        }

        String oldTitle = null;
        boolean titleChanged = false;

        if (request.getTitle() != null
                && !request.getTitle().equals(ticket.getTitle())) {

            oldTitle = ticket.getTitle();
            ticket.setTitle(request.getTitle());

            titleChanged = true;
        }

        String oldDescription = null;
        boolean descriptionChanged = false;

        if (request.getDescription() != null
                && !request.getDescription().equals(ticket.getDescription())) {

            oldDescription = ticket.getDescription();
            ticket.setDescription(request.getDescription());

            descriptionChanged = true;
        }

        String oldCategory = null;
        boolean categoryChanged = false;

        if (request.getCategoryId() != null && !request.getCategoryId()
                .equals(ticket.getCategory().getIdCategory())) {

            CategoryModel category = categoryRepository
                    .findByIdCategoryAndActiveTrue(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Active category with id " + request.getCategoryId() + " not found"));

            oldCategory = ticket.getCategory().getName();
            ticket.setCategory(category);

            categoryChanged = true;
        }

        ticket.setLastUpdated(LocalDateTime.now());

        TicketModel updatedTicket = ticketRepository.save(ticket);

        if (titleChanged) {
            ticketHistoryService.createHistory(
                    updatedTicket,
                    currentUser,
                    TicketHistoryAction.TITLE_CHANGED,
                    "title",
                    oldTitle,
                    updatedTicket.getTitle());
        }

        if (descriptionChanged) {
            ticketHistoryService.createHistory(
                    updatedTicket,
                    currentUser,
                    TicketHistoryAction.DESCRIPTION_CHANGED,
                    "description",
                    oldDescription,
                    updatedTicket.getDescription());
        }

        if (categoryChanged) {
            ticketHistoryService.createHistory(
                    updatedTicket,
                    currentUser,
                    TicketHistoryAction.CATEGORY_CHANGED,
                    "category",
                    oldCategory,
                    updatedTicket.getCategory().getName());
        }

        return convertToResponse(updatedTicket);
    }

    @Transactional
    public TicketResponse assignTicket(
            Long ticketId,
            AssignTicketRequest request) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User with id " + request.getAssignedToId() + " not found"));

        if (!assignedTo.getRol().getName()
                .equalsIgnoreCase(RoleName.TECHNICIAN.name())) {

            throw new InvalidRoleException(
                    "Assigned user must have the TECHNICIAN role");
        }

        if (ticket.getAssignedTo() != null
                && ticket.getAssignedTo().getIdUser()
                        .equals(assignedTo.getIdUser())) {

            throw new InvalidOperationException(
                    "The ticket is already assigned to this technician");
        }

        UserModel currentUser = getAuthenticatedUser();

        String oldAssignedTo = null;

        TicketHistoryAction action = TicketHistoryAction.ASSIGNED;

        if (ticket.getAssignedTo() != null) {

            oldAssignedTo = ticket.getAssignedTo().getUsername();

            action = TicketHistoryAction.REASSIGNED;
        }

        ticket.setAssignedTo(assignedTo);
        ticket.setLastUpdated(LocalDateTime.now());

        TicketModel updatedTicket = ticketRepository.save(ticket);

        ticketHistoryService.createHistory(
                updatedTicket,
                currentUser,
                action,
                "assignedTo",
                oldAssignedTo,
                updatedTicket.getAssignedTo()
                        .getUsername());

        return convertToResponse(updatedTicket);
    }

    @Transactional
    public TicketResponse changePriority(
            Long ticketId,
            ChangePriorityRequest request) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        PriorityModel priority = priorityRepository
                .findByIdPriorityAndActiveTrue(request.getPriorityId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active priority with id " + request.getPriorityId() + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        String oldPriority = ticket.getPriority().getName();

        if (ticket.getPriority().getIdPriority()
                .equals(priority.getIdPriority())) {

            throw new InvalidOperationException(
                    "The ticket already has the selected priority");
        }

        ticket.setPriority(priority);
        ticket.setLastUpdated(LocalDateTime.now());

        TicketModel updatedTicket = ticketRepository.save(ticket);

        ticketHistoryService.createHistory(
                updatedTicket,
                currentUser,
                TicketHistoryAction.PRIORITY_CHANGED,
                "priority",
                oldPriority,
                updatedTicket.getPriority().getName());

        return convertToResponse(updatedTicket);
    }

    @Transactional
    public TicketResponse changeStatus(
            Long ticketId,
            ChangeStatusRequest request) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        StatusModel status = statusRepository
                .findByIdStatusAndActiveTrue(request.getStatusId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active status with id " + request.getStatusId() + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        String oldStatus = ticket.getStatus().getName();

        if (ticket.getStatus().getIdStatus()
                .equals(status.getIdStatus())) {

            throw new InvalidOperationException(
                    "The ticket already has the selected status");
        }

        ticket.setStatus(status);
        ticket.setLastUpdated(LocalDateTime.now());

        TicketModel updatedTicket = ticketRepository.save(ticket);

        ticketHistoryService.createHistory(
                updatedTicket,
                currentUser,
                TicketHistoryAction.STATUS_CHANGED,
                "status",
                oldStatus,
                updatedTicket.getStatus().getName());

        return convertToResponse(updatedTicket);
    }

    public TicketStatisticsResponse getTicketStatistics() {

        UserModel currentUser = getAuthenticatedUser();

        String role = currentUser.getRol().getName();

        long totalTickets;
        long openTickets;
        long inProgressTickets;
        long criticalTickets;

        if (role.equalsIgnoreCase(RoleName.USER.name())) {

            totalTickets = ticketRepository.countRelatedToUser(
                    currentUser);

            openTickets = ticketRepository.countRelatedToUserByStatus(
                    currentUser,
                    StatusName.OPEN.name());

            inProgressTickets = ticketRepository.countRelatedToUserByStatus(
                    currentUser,
                    StatusName.IN_PROGRESS.name());

            criticalTickets = ticketRepository.countRelatedToUserByPriority(
                    currentUser,
                    PriorityName.CRITICAL.name());

        } else if (role.equalsIgnoreCase(
                RoleName.TECHNICIAN.name())) {

            totalTickets = ticketRepository.countByAssignedTo(
                    currentUser);

            openTickets = ticketRepository.countByAssignedToAndStatus_Name(
                    currentUser,
                    StatusName.OPEN.name());

            inProgressTickets = ticketRepository.countByAssignedToAndStatus_Name(
                    currentUser,
                    StatusName.IN_PROGRESS.name());

            criticalTickets = ticketRepository.countByAssignedToAndPriority_Name(
                    currentUser,
                    PriorityName.CRITICAL.name());

        } else {

            totalTickets = ticketRepository.count();

            openTickets = ticketRepository.countByStatus_Name(
                    StatusName.OPEN.name());

            inProgressTickets = ticketRepository.countByStatus_Name(
                    StatusName.IN_PROGRESS.name());

            criticalTickets = ticketRepository.countByPriority_Name(
                    PriorityName.CRITICAL.name());
        }

        return new TicketStatisticsResponse(
                totalTickets,
                openTickets,
                inProgressTickets,
                criticalTickets);
    }

    public Page<TicketResponse> getAssignedTickets(
            Pageable pageable) {

        UserModel currentUser = getAuthenticatedUser();

        Page<TicketModel> tickets = ticketRepository.findByAssignedTo(
                currentUser,
                pageable);

        return tickets.map(this::convertToResponse);
    }

    private UserModel getAuthenticatedUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    private TicketResponse convertToResponse(TicketModel ticket) {

        UserSummaryResponse createdByResponse = null;

        if (ticket.getCreatedBy() != null) {
            createdByResponse = new UserSummaryResponse(
                    ticket.getCreatedBy().getIdUser(),
                    ticket.getCreatedBy().getUsername());
        }

        UserSummaryResponse requestedForResponse = null;

        if (ticket.getRequestedFor() != null) {
            requestedForResponse = new UserSummaryResponse(
                    ticket.getRequestedFor().getIdUser(),
                    ticket.getRequestedFor().getUsername());
        }

        UserSummaryResponse assignedToResponse = null;

        if (ticket.getAssignedTo() != null) {
            assignedToResponse = new UserSummaryResponse(
                    ticket.getAssignedTo().getIdUser(),
                    ticket.getAssignedTo().getUsername());
        }

        CategoryResponse categoryResponse = null;

        if (ticket.getCategory() != null) {
            categoryResponse = new CategoryResponse(
                    ticket.getCategory().getIdCategory(),
                    ticket.getCategory().getName(),
                    ticket.getCategory().isActive());
        }

        PriorityResponse priorityResponse = null;

        if (ticket.getPriority() != null) {
            priorityResponse = new PriorityResponse(
                    ticket.getPriority().getIdPriority(),
                    ticket.getPriority().getName(),
                    ticket.getPriority().isActive());
        }

        StatusResponse statusResponse = null;

        if (ticket.getStatus() != null) {
            statusResponse = new StatusResponse(
                    ticket.getStatus().getIdStatus(),
                    ticket.getStatus().getName(),
                    ticket.getStatus().isActive());
        }

        return new TicketResponse(
                ticket.getIdTicket(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCreatedAt(),
                ticket.getLastUpdated(),
                createdByResponse,
                requestedForResponse,
                assignedToResponse,
                categoryResponse,
                priorityResponse,
                statusResponse);
    }
}