package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

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
import com.example.back_end.enums.ProtectedPriority;
import com.example.back_end.enums.ProtectedStatus;
import com.example.back_end.enums.RoleName;
import com.example.back_end.enums.TicketHistoryAction;
import com.example.back_end.exception.InvalidOperationException;
import com.example.back_end.exception.InvalidRoleException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.CategoryModel;
import com.example.back_end.model.PriorityModel;
import com.example.back_end.model.RoleModel;
import com.example.back_end.model.StatusModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.CategoryRepository;
import com.example.back_end.repository.PriorityRepository;
import com.example.back_end.repository.StatusRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private PriorityRepository priorityRepository;

    @Mock
    private StatusRepository statusRepository;

    @Mock
    private TicketHistoryService ticketHistoryService;

    @Mock
    private Pageable pageable;

    @Mock
    private Authentication authentication;

    @Mock
    private CreateTicketRequest createTicketRequest;

    @Mock
    private UpdateTicketRequest updateTicketRequest;

    @Mock
    private AssignTicketRequest assignTicketRequest;

    @Mock
    private ChangePriorityRequest changePriorityRequest;

    @Mock
    private ChangeStatusRequest changeStatusRequest;

    @InjectMocks
    private TicketService ticketService;

    @AfterEach
    void tearDown() {

        SecurityContextHolder.clearContext();
    }

    @Test
    void getAllTicketsShouldReturnMappedTickets() {

        UserModel createdBy = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        UserModel requestedFor = createUser(
                2L,
                "john",
                RoleName.USER.name());

        UserModel assignedTo = createUser(
                3L,
                "technician",
                RoleName.TECHNICIAN.name());

        CategoryModel category = createCategory(
                1L,
                "Hardware");

        PriorityModel priority = createPriority(
                1L,
                "HIGH");

        StatusModel status = createStatus(
                1L,
                ProtectedStatus.OPEN.name());

        TicketModel ticket = createTicket(
                1L,
                createdBy,
                requestedFor,
                assignedTo,
                category,
                priority,
                status);

        when(ticketRepository.findAll(
                ArgumentMatchers.<Specification<TicketModel>>any(),
                eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(ticket)));

        Page<TicketResponse> result = ticketService.getAllTickets(
                "Printer",
                "OPEN",
                "HIGH",
                "Hardware",
                pageable);

        assertThat(result.getContent())
                .hasSize(1);

        TicketResponse expected = createExpectedTicketResponse(ticket);

        assertThat(result.getContent().get(0))
                .usingRecursiveComparison()
                .isEqualTo(expected);

        verify(ticketRepository).findAll(
                ArgumentMatchers.<Specification<TicketModel>>any(),
                eq(pageable));
    }

    @Test
    void getTicketByIdShouldReturnTicketForUserWhoCreatedTicket() {

        Long ticketId = 1L;

        UserModel currentUser = createUser(
                1L,
                "john",
                RoleName.USER.name());

        UserModel requestedFor = createUser(
                2L,
                "mary",
                RoleName.USER.name());

        TicketModel ticket = createTicket(
                ticketId,
                currentUser,
                requestedFor,
                null,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        configureAuthenticatedUser(currentUser);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        TicketResponse result = ticketService.getTicketById(ticketId);

        assertThat(result)
                .usingRecursiveComparison()
                .isEqualTo(createExpectedTicketResponse(ticket));
    }

    @Test
    void getTicketByIdShouldReturnTicketForRequestedUser() {

        Long ticketId = 1L;

        UserModel createdBy = createUser(
                1L,
                "john",
                RoleName.USER.name());

        UserModel currentUser = createUser(
                2L,
                "mary",
                RoleName.USER.name());

        TicketModel ticket = createTicket(
                ticketId,
                createdBy,
                currentUser,
                null,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        configureAuthenticatedUser(currentUser);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        TicketResponse result = ticketService.getTicketById(ticketId);

        assertThat(result)
                .isNotNull();
    }

    @Test
    void getTicketByIdShouldThrowAccessDeniedWhenUserIsNotRelatedToTicket() {

        Long ticketId = 1L;

        UserModel currentUser = createUser(
                3L,
                "other-user",
                RoleName.USER.name());

        TicketModel ticket = createTicket(
                ticketId,
                createUser(1L, "john", RoleName.USER.name()),
                createUser(2L, "mary", RoleName.USER.name()),
                null,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        configureAuthenticatedUser(currentUser);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(
                () -> ticketService.getTicketById(ticketId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage(
                        "You do not have permission to access this ticket");
    }

    @Test
    void getTicketByIdShouldThrowExceptionWhenTicketDoesNotExist() {

        Long ticketId = 1L;

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketService.getTicketById(ticketId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Ticket with id " + ticketId + " not found");

        verify(userRepository, never())
                .findByUsername(any());
    }

    @Test
    void getMyTicketsShouldReturnMappedTickets() {

        UserModel currentUser = createUser(
                1L,
                "john",
                RoleName.USER.name());

        configureAuthenticatedUser(currentUser);

        TicketModel ticket = createTicket(
                1L,
                currentUser,
                currentUser,
                null,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        when(ticketRepository.findAll(
                ArgumentMatchers.<Specification<TicketModel>>any(),
                eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(ticket)));

        Page<TicketResponse> result = ticketService.getMyTickets(
                null,
                null,
                null,
                null,
                pageable);

        assertThat(result.getContent())
                .hasSize(1);

        verify(ticketRepository).findAll(
                ArgumentMatchers.<Specification<TicketModel>>any(),
                eq(pageable));
    }

    @Test
    void getAssignedTicketsShouldReturnMappedTickets() {

        UserModel currentUser = createUser(
                1L,
                "technician",
                RoleName.TECHNICIAN.name());

        configureAuthenticatedUser(currentUser);

        TicketModel ticket = createTicket(
                1L,
                createUser(2L, "admin", RoleName.ADMIN.name()),
                createUser(3L, "john", RoleName.USER.name()),
                currentUser,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        when(ticketRepository.findAll(
                ArgumentMatchers.<Specification<TicketModel>>any(),
                eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(ticket)));

        Page<TicketResponse> result = ticketService.getAssignedTickets(
                null,
                null,
                null,
                null,
                pageable);

        assertThat(result.getContent())
                .hasSize(1);

        verify(ticketRepository).findAll(
                ArgumentMatchers.<Specification<TicketModel>>any(),
                eq(pageable));
    }

    @Test
    void createTicketShouldCreateTicketAndHistory() {

        UserModel createdBy = createUser(
                1L,
                "john",
                RoleName.USER.name());

        UserModel requestedFor = createUser(
                2L,
                "mary",
                RoleName.USER.name());

        CategoryModel category = createCategory(
                1L,
                "Hardware");

        PriorityModel priority = createPriority(
                1L,
                "HIGH");

        StatusModel status = createStatus(
                1L,
                ProtectedStatus.OPEN.name());

        configureAuthenticatedUser(createdBy);

        when(createTicketRequest.getTitle())
                .thenReturn("Printer problem");

        when(createTicketRequest.getDescription())
                .thenReturn("Printer does not work");

        when(createTicketRequest.getRequestedForId())
                .thenReturn(2L);

        when(createTicketRequest.getCategoryId())
                .thenReturn(1L);

        when(createTicketRequest.getPriorityId())
                .thenReturn(1L);

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(requestedFor));

        when(categoryRepository.findByIdCategoryAndActiveTrue(1L))
                .thenReturn(Optional.of(category));

        when(priorityRepository.findByIdPriorityAndActiveTrue(1L))
                .thenReturn(Optional.of(priority));

        when(statusRepository.findByNameAndActiveTrue(
                ProtectedStatus.OPEN.name()))
                .thenReturn(Optional.of(status));

        when(ticketRepository.save(any(TicketModel.class)))
                .thenAnswer(invocation -> {

                    TicketModel ticket = invocation.getArgument(0);

                    ticket.setIdTicket(1L);

                    return ticket;
                });

        LocalDateTime beforeCreation = LocalDateTime.now();

        TicketResponse result = ticketService.createTicket(createTicketRequest);

        LocalDateTime afterCreation = LocalDateTime.now();

        ArgumentCaptor<TicketModel> ticketCaptor = ArgumentCaptor.forClass(TicketModel.class);

        verify(ticketRepository)
                .save(ticketCaptor.capture());

        TicketModel savedTicket = ticketCaptor.getValue();

        assertThat(savedTicket.getTitle())
                .isEqualTo("Printer problem");

        assertThat(savedTicket.getDescription())
                .isEqualTo("Printer does not work");

        assertThat(savedTicket.getCreatedBy())
                .isSameAs(createdBy);

        assertThat(savedTicket.getRequestedFor())
                .isSameAs(requestedFor);

        assertThat(savedTicket.getCategory())
                .isSameAs(category);

        assertThat(savedTicket.getPriority())
                .isSameAs(priority);

        assertThat(savedTicket.getStatus())
                .isSameAs(status);

        assertThat(savedTicket.getCreatedAt())
                .isBetween(
                        beforeCreation,
                        afterCreation);

        assertThat(savedTicket.getLastUpdated())
                .isBetween(
                        beforeCreation,
                        afterCreation);

        verify(ticketHistoryService).createHistory(
                savedTicket,
                createdBy,
                TicketHistoryAction.TICKET_CREATED,
                null,
                null,
                null);

        assertThat(result.getIdTicket())
                .isEqualTo(1L);
    }

    @Test
    void createTicketShouldThrowExceptionWhenRequestedUserDoesNotExist() {

        UserModel createdBy = createUser(
                1L,
                "john",
                RoleName.USER.name());

        configureAuthenticatedUser(createdBy);

        when(createTicketRequest.getRequestedForId())
                .thenReturn(2L);

        when(userRepository.findById(2L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketService.createTicket(createTicketRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Requested user not found");

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void createTicketShouldThrowExceptionWhenCategoryIsNotActive() {

        UserModel createdBy = createUser(
                1L,
                "john",
                RoleName.USER.name());

        UserModel requestedFor = createUser(
                2L,
                "mary",
                RoleName.USER.name());

        configureAuthenticatedUser(createdBy);

        when(createTicketRequest.getRequestedForId())
                .thenReturn(2L);

        when(createTicketRequest.getCategoryId())
                .thenReturn(5L);

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(requestedFor));

        when(categoryRepository.findByIdCategoryAndActiveTrue(5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketService.createTicket(createTicketRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Active category with id 5 not found");

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void createTicketShouldThrowExceptionWhenPriorityIsNotActive() {

        UserModel createdBy = createUser(
                1L,
                "john",
                RoleName.USER.name());

        UserModel requestedFor = createUser(
                2L,
                "mary",
                RoleName.USER.name());

        CategoryModel category = createCategory(1L, "Hardware");

        configureAuthenticatedUser(createdBy);

        when(createTicketRequest.getRequestedForId())
                .thenReturn(2L);

        when(createTicketRequest.getCategoryId())
                .thenReturn(1L);

        when(createTicketRequest.getPriorityId())
                .thenReturn(5L);

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(requestedFor));

        when(categoryRepository.findByIdCategoryAndActiveTrue(1L))
                .thenReturn(Optional.of(category));

        when(priorityRepository.findByIdPriorityAndActiveTrue(5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketService.createTicket(createTicketRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Active priority with id 5 not found");

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void createTicketShouldThrowExceptionWhenOpenStatusDoesNotExist() {

        UserModel createdBy = createUser(
                1L,
                "john",
                RoleName.USER.name());

        UserModel requestedFor = createUser(
                2L,
                "mary",
                RoleName.USER.name());

        CategoryModel category = createCategory(1L, "Hardware");

        PriorityModel priority = createPriority(1L, "HIGH");

        configureAuthenticatedUser(createdBy);

        when(createTicketRequest.getRequestedForId())
                .thenReturn(2L);

        when(createTicketRequest.getCategoryId())
                .thenReturn(1L);

        when(createTicketRequest.getPriorityId())
                .thenReturn(1L);

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(requestedFor));

        when(categoryRepository.findByIdCategoryAndActiveTrue(1L))
                .thenReturn(Optional.of(category));

        when(priorityRepository.findByIdPriorityAndActiveTrue(1L))
                .thenReturn(Optional.of(priority));

        when(statusRepository.findByNameAndActiveTrue(
                ProtectedStatus.OPEN.name()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketService.createTicket(createTicketRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Active OPEN status not found");

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void updateTicketShouldUpdateFieldsAndCreateHistory() {

        Long ticketId = 1L;

        UserModel admin = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        CategoryModel oldCategory = createCategory(1L, "Hardware");

        CategoryModel newCategory = createCategory(2L, "Software");

        TicketModel ticket = createTicket(
                ticketId,
                admin,
                admin,
                null,
                oldCategory,
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        ticket.setTitle("Old title");
        ticket.setDescription("Old description");

        configureAuthenticatedUser(admin);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(updateTicketRequest.getTitle())
                .thenReturn("New title");

        when(updateTicketRequest.getDescription())
                .thenReturn("New description");

        when(updateTicketRequest.getCategoryId())
                .thenReturn(2L);

        when(categoryRepository.findByIdCategoryAndActiveTrue(2L))
                .thenReturn(Optional.of(newCategory));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse result = ticketService.updateTicket(
                ticketId,
                updateTicketRequest);

        assertThat(ticket.getTitle())
                .isEqualTo("New title");

        assertThat(ticket.getDescription())
                .isEqualTo("New description");

        assertThat(ticket.getCategory())
                .isSameAs(newCategory);

        verify(ticketHistoryService).createHistory(
                ticket,
                admin,
                TicketHistoryAction.TITLE_CHANGED,
                "title",
                "Old title",
                "New title");

        verify(ticketHistoryService).createHistory(
                ticket,
                admin,
                TicketHistoryAction.DESCRIPTION_CHANGED,
                "description",
                "Old description",
                "New description");

        verify(ticketHistoryService).createHistory(
                ticket,
                admin,
                TicketHistoryAction.CATEGORY_CHANGED,
                "category",
                "Hardware",
                "Software");

        assertThat(result.getTitle())
                .isEqualTo("New title");
    }

    @Test
    void updateTicketShouldThrowAccessDeniedWhenUserIsNotRelatedToTicket() {

        Long ticketId = 1L;

        UserModel currentUser = createUser(
                3L,
                "other-user",
                RoleName.USER.name());

        TicketModel ticket = createTicket(
                ticketId,
                createUser(1L, "john", RoleName.USER.name()),
                createUser(2L, "mary", RoleName.USER.name()),
                null,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        configureAuthenticatedUser(currentUser);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(
                () -> ticketService.updateTicket(
                        ticketId,
                        updateTicketRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage(
                        "You do not have permission to access this ticket");

        verify(ticketRepository, never())
                .save(ticket);
    }

    @Test
    void updateTicketShouldThrowAccessDeniedWhenTechnicianIsNotAssigned() {

        Long ticketId = 1L;

        UserModel currentTechnician = createUser(
                3L,
                "technician",
                RoleName.TECHNICIAN.name());

        UserModel otherTechnician = createUser(
                4L,
                "other-technician",
                RoleName.TECHNICIAN.name());

        TicketModel ticket = createTicket(
                ticketId,
                createUser(1L, "admin", RoleName.ADMIN.name()),
                createUser(2L, "john", RoleName.USER.name()),
                otherTechnician,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        configureAuthenticatedUser(currentTechnician);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        assertThatThrownBy(
                () -> ticketService.updateTicket(
                        ticketId,
                        updateTicketRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage(
                        "You can only update tickets assigned to you");

        verify(ticketRepository, never())
                .save(ticket);
    }

    @Test
    void assignTicketShouldAssignTechnicianAndCreateHistory() {

        Long ticketId = 1L;

        UserModel admin = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        UserModel technician = createUser(
                3L,
                "technician",
                RoleName.TECHNICIAN.name());

        TicketModel ticket = createTicket(
                ticketId,
                admin,
                createUser(2L, "john", RoleName.USER.name()),
                null,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        configureAuthenticatedUser(admin);

        when(assignTicketRequest.getAssignedToId())
                .thenReturn(3L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findById(3L))
                .thenReturn(Optional.of(technician));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse result = ticketService.assignTicket(
                ticketId,
                assignTicketRequest);

        assertThat(ticket.getAssignedTo())
                .isSameAs(technician);

        verify(ticketHistoryService).createHistory(
                ticket,
                admin,
                TicketHistoryAction.ASSIGNED,
                "assignedTo",
                null,
                "technician");

        assertThat(result)
                .isNotNull();
    }

    @Test
    void assignTicketShouldCreateReassignedHistoryWhenTicketAlreadyAssigned() {

        Long ticketId = 1L;

        UserModel admin = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        UserModel oldTechnician = createUser(
                3L,
                "old-technician",
                RoleName.TECHNICIAN.name());

        UserModel newTechnician = createUser(
                4L,
                "new-technician",
                RoleName.TECHNICIAN.name());

        TicketModel ticket = createTicket(
                ticketId,
                admin,
                createUser(2L, "john", RoleName.USER.name()),
                oldTechnician,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                createStatus(1L, ProtectedStatus.OPEN.name()));

        configureAuthenticatedUser(admin);

        when(assignTicketRequest.getAssignedToId())
                .thenReturn(4L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findById(4L))
                .thenReturn(Optional.of(newTechnician));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        ticketService.assignTicket(
                ticketId,
                assignTicketRequest);

        verify(ticketHistoryService).createHistory(
                ticket,
                admin,
                TicketHistoryAction.REASSIGNED,
                "assignedTo",
                "old-technician",
                "new-technician");
    }

    @Test
    void assignTicketShouldThrowInvalidRoleWhenAssignedUserIsNotTechnician() {

        Long ticketId = 1L;

        UserModel user = createUser(
                2L,
                "john",
                RoleName.USER.name());

        when(assignTicketRequest.getAssignedToId())
                .thenReturn(2L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(new TicketModel()));

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(user));

        assertThatThrownBy(
                () -> ticketService.assignTicket(
                        ticketId,
                        assignTicketRequest))
                .isInstanceOf(InvalidRoleException.class)
                .hasMessage(
                        "Assigned user must have the TECHNICIAN role");

        verify(ticketRepository, never())
                .save(any(TicketModel.class));
    }

    @Test
    void assignTicketShouldThrowInvalidOperationWhenAlreadyAssignedToTechnician() {

        Long ticketId = 1L;

        UserModel technician = createUser(
                3L,
                "technician",
                RoleName.TECHNICIAN.name());

        TicketModel ticket = new TicketModel();
        ticket.setAssignedTo(technician);

        when(assignTicketRequest.getAssignedToId())
                .thenReturn(3L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(userRepository.findById(3L))
                .thenReturn(Optional.of(technician));

        assertThatThrownBy(
                () -> ticketService.assignTicket(
                        ticketId,
                        assignTicketRequest))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage(
                        "The ticket is already assigned to this technician");

        verify(ticketRepository, never())
                .save(ticket);
    }

    @Test
    void changePriorityShouldChangePriorityAndCreateHistory() {

        Long ticketId = 1L;

        UserModel admin = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        PriorityModel oldPriority = createPriority(1L, "LOW");

        PriorityModel newPriority = createPriority(2L, "HIGH");

        TicketModel ticket = createTicket(
                ticketId,
                admin,
                admin,
                null,
                createCategory(1L, "Hardware"),
                oldPriority,
                createStatus(1L, ProtectedStatus.OPEN.name()));

        configureAuthenticatedUser(admin);

        when(changePriorityRequest.getPriorityId())
                .thenReturn(2L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(priorityRepository.findByIdPriorityAndActiveTrue(2L))
                .thenReturn(Optional.of(newPriority));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse result = ticketService.changePriority(
                ticketId,
                changePriorityRequest);

        assertThat(ticket.getPriority())
                .isSameAs(newPriority);

        verify(ticketHistoryService).createHistory(
                ticket,
                admin,
                TicketHistoryAction.PRIORITY_CHANGED,
                "priority",
                "LOW",
                "HIGH");

        assertThat(result)
                .isNotNull();
    }

    @Test
    void changePriorityShouldThrowInvalidOperationWhenPriorityDoesNotChange() {

        Long ticketId = 1L;

        PriorityModel priority = createPriority(1L, "HIGH");

        TicketModel ticket = new TicketModel();
        ticket.setPriority(priority);

        UserModel admin = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        configureAuthenticatedUser(admin);

        when(changePriorityRequest.getPriorityId())
                .thenReturn(1L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(priorityRepository.findByIdPriorityAndActiveTrue(1L))
                .thenReturn(Optional.of(priority));

        assertThatThrownBy(
                () -> ticketService.changePriority(
                        ticketId,
                        changePriorityRequest))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage(
                        "The ticket already has the selected priority");

        verify(ticketRepository, never())
                .save(ticket);
    }

    @Test
    void changePriorityShouldThrowExceptionWhenPriorityIsNotActive() {

        Long ticketId = 1L;

        when(changePriorityRequest.getPriorityId())
                .thenReturn(5L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(new TicketModel()));

        when(priorityRepository.findByIdPriorityAndActiveTrue(5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketService.changePriority(
                        ticketId,
                        changePriorityRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Active priority with id 5 not found");
    }

    @Test
    void changeStatusShouldChangeStatusAndCreateHistory() {

        Long ticketId = 1L;

        UserModel admin = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        StatusModel oldStatus = createStatus(
                1L,
                ProtectedStatus.OPEN.name());

        StatusModel newStatus = createStatus(
                2L,
                ProtectedStatus.IN_PROGRESS.name());

        TicketModel ticket = createTicket(
                ticketId,
                admin,
                admin,
                null,
                createCategory(1L, "Hardware"),
                createPriority(1L, "HIGH"),
                oldStatus);

        configureAuthenticatedUser(admin);

        when(changeStatusRequest.getStatusId())
                .thenReturn(2L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(statusRepository.findByIdStatusAndActiveTrue(2L))
                .thenReturn(Optional.of(newStatus));

        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        TicketResponse result = ticketService.changeStatus(
                ticketId,
                changeStatusRequest);

        assertThat(ticket.getStatus())
                .isSameAs(newStatus);

        verify(ticketHistoryService).createHistory(
                ticket,
                admin,
                TicketHistoryAction.STATUS_CHANGED,
                "status",
                ProtectedStatus.OPEN.name(),
                ProtectedStatus.IN_PROGRESS.name());

        assertThat(result)
                .isNotNull();
    }

    @Test
    void changeStatusShouldThrowInvalidOperationWhenStatusDoesNotChange() {

        Long ticketId = 1L;

        StatusModel status = createStatus(
                1L,
                ProtectedStatus.OPEN.name());

        TicketModel ticket = new TicketModel();
        ticket.setStatus(status);

        UserModel admin = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        configureAuthenticatedUser(admin);

        when(changeStatusRequest.getStatusId())
                .thenReturn(1L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(ticket));

        when(statusRepository.findByIdStatusAndActiveTrue(1L))
                .thenReturn(Optional.of(status));

        assertThatThrownBy(
                () -> ticketService.changeStatus(
                        ticketId,
                        changeStatusRequest))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage(
                        "The ticket already has the selected status");

        verify(ticketRepository, never())
                .save(ticket);
    }

    @Test
    void changeStatusShouldThrowExceptionWhenStatusIsNotActive() {

        Long ticketId = 1L;

        when(changeStatusRequest.getStatusId())
                .thenReturn(5L);

        when(ticketRepository.findById(ticketId))
                .thenReturn(Optional.of(new TicketModel()));

        when(statusRepository.findByIdStatusAndActiveTrue(5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketService.changeStatus(
                        ticketId,
                        changeStatusRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Active status with id 5 not found");
    }

    @Test
    void getTicketStatisticsShouldReturnUserStatistics() {

        UserModel user = createUser(
                1L,
                "john",
                RoleName.USER.name());

        configureAuthenticatedUser(user);

        when(ticketRepository.countRelatedToUser(user))
                .thenReturn(10L);

        when(ticketRepository.countRelatedToUserByStatus(
                user,
                ProtectedStatus.OPEN.name()))
                .thenReturn(4L);

        when(ticketRepository.countRelatedToUserByStatus(
                user,
                ProtectedStatus.IN_PROGRESS.name()))
                .thenReturn(3L);

        when(ticketRepository.countRelatedToUserByPriority(
                user,
                ProtectedPriority.CRITICAL.name()))
                .thenReturn(2L);

        TicketStatisticsResponse result = ticketService.getTicketStatistics();

        TicketStatisticsResponse expected = new TicketStatisticsResponse(
                10L,
                4L,
                3L,
                2L);

        assertThat(result)
                .usingRecursiveComparison()
                .isEqualTo(expected);
    }

    @Test
    void getTicketStatisticsShouldReturnTechnicianStatistics() {

        UserModel technician = createUser(
                1L,
                "technician",
                RoleName.TECHNICIAN.name());

        configureAuthenticatedUser(technician);

        when(ticketRepository.countByAssignedTo(technician))
                .thenReturn(20L);

        when(ticketRepository.countByAssignedToAndStatus_Name(
                technician,
                ProtectedStatus.OPEN.name()))
                .thenReturn(6L);

        when(ticketRepository.countByAssignedToAndStatus_Name(
                technician,
                ProtectedStatus.IN_PROGRESS.name()))
                .thenReturn(5L);

        when(ticketRepository.countByAssignedToAndPriority_Name(
                technician,
                ProtectedPriority.CRITICAL.name()))
                .thenReturn(3L);

        TicketStatisticsResponse result = ticketService.getTicketStatistics();

        TicketStatisticsResponse expected = new TicketStatisticsResponse(
                20L,
                6L,
                5L,
                3L);

        assertThat(result)
                .usingRecursiveComparison()
                .isEqualTo(expected);
    }

    @Test
    void getTicketStatisticsShouldReturnGlobalStatisticsForAdmin() {

        UserModel admin = createUser(
                1L,
                "admin",
                RoleName.ADMIN.name());

        configureAuthenticatedUser(admin);

        when(ticketRepository.count())
                .thenReturn(100L);

        when(ticketRepository.countByStatus_Name(
                ProtectedStatus.OPEN.name()))
                .thenReturn(40L);

        when(ticketRepository.countByStatus_Name(
                ProtectedStatus.IN_PROGRESS.name()))
                .thenReturn(30L);

        when(ticketRepository.countByPriority_Name(
                ProtectedPriority.CRITICAL.name()))
                .thenReturn(10L);

        TicketStatisticsResponse result = ticketService.getTicketStatistics();

        TicketStatisticsResponse expected = new TicketStatisticsResponse(
                100L,
                40L,
                30L,
                10L);

        assertThat(result)
                .usingRecursiveComparison()
                .isEqualTo(expected);
    }

    @Test
    void getTicketStatisticsShouldThrowExceptionWhenAuthenticatedUserDoesNotExist() {

        configureAuthentication("unknown");

        when(userRepository.findByUsername("unknown"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> ticketService.getTicketStatistics())
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Authenticated user not found");
    }

    private void configureAuthentication(
            String username) {

        SecurityContext context = SecurityContextHolder.createEmptyContext();

        when(authentication.getName())
                .thenReturn(username);

        context.setAuthentication(authentication);

        SecurityContextHolder.setContext(context);
    }

    private void configureAuthenticatedUser(
            UserModel user) {

        configureAuthentication(user.getUsername());

        when(userRepository.findByUsername(user.getUsername()))
                .thenReturn(Optional.of(user));
    }

    private UserModel createUser(
            Long id,
            String username,
            String roleName) {

        RoleModel role = new RoleModel();
        role.setName(roleName);

        UserModel user = new UserModel();
        user.setIdUser(id);
        user.setUsername(username);
        user.setRole(role);
        user.setEnabled(true);

        return user;
    }

    private CategoryModel createCategory(
            Long id,
            String name) {

        CategoryModel category = new CategoryModel();

        category.setIdCategory(id);
        category.setName(name);
        category.setActive(true);

        return category;
    }

    private PriorityModel createPriority(
            Long id,
            String name) {

        PriorityModel priority = new PriorityModel();

        priority.setIdPriority(id);
        priority.setName(name);
        priority.setActive(true);

        return priority;
    }

    private StatusModel createStatus(
            Long id,
            String name) {

        StatusModel status = new StatusModel();

        status.setIdStatus(id);
        status.setName(name);
        status.setActive(true);

        return status;
    }

    private TicketModel createTicket(
            Long id,
            UserModel createdBy,
            UserModel requestedFor,
            UserModel assignedTo,
            CategoryModel category,
            PriorityModel priority,
            StatusModel status) {

        LocalDateTime createdAt = LocalDateTime.of(
                2026,
                11,
                3,
                10,
                0);

        TicketModel ticket = new TicketModel();

        ticket.setIdTicket(id);
        ticket.setTitle("Printer issue");
        ticket.setDescription("Printer does not work");

        ticket.setCreatedAt(createdAt);
        ticket.setLastUpdated(createdAt);

        ticket.setCreatedBy(createdBy);
        ticket.setRequestedFor(requestedFor);
        ticket.setAssignedTo(assignedTo);

        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(status);

        return ticket;
    }

    private TicketResponse createExpectedTicketResponse(
            TicketModel ticket) {

        UserSummaryResponse createdByResponse = ticket.getCreatedBy() == null
                ? null
                : new UserSummaryResponse(
                        ticket.getCreatedBy().getIdUser(),
                        ticket.getCreatedBy().getUsername());

        UserSummaryResponse requestedForResponse = ticket.getRequestedFor() == null
                ? null
                : new UserSummaryResponse(
                        ticket.getRequestedFor().getIdUser(),
                        ticket.getRequestedFor().getUsername());

        UserSummaryResponse assignedToResponse = ticket.getAssignedTo() == null
                ? null
                : new UserSummaryResponse(
                        ticket.getAssignedTo().getIdUser(),
                        ticket.getAssignedTo().getUsername());

        CategoryResponse categoryResponse = ticket.getCategory() == null
                ? null
                : new CategoryResponse(
                        ticket.getCategory().getIdCategory(),
                        ticket.getCategory().getName(),
                        ticket.getCategory().isActive());

        PriorityResponse priorityResponse = ticket.getPriority() == null
                ? null
                : new PriorityResponse(
                        ticket.getPriority().getIdPriority(),
                        ticket.getPriority().getName(),
                        ticket.getPriority().isActive());

        StatusResponse statusResponse = ticket.getStatus() == null
                ? null
                : new StatusResponse(
                        ticket.getStatus().getIdStatus(),
                        ticket.getStatus().getName(),
                        ticket.getStatus().isActive());

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