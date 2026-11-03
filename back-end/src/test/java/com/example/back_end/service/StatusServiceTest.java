package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.back_end.dtos.status.StatusRequest;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.enums.ProtectedStatus;
import com.example.back_end.exception.ProtectedResourceException;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.StatusModel;
import com.example.back_end.repository.StatusRepository;

@ExtendWith(MockitoExtension.class)
class StatusServiceTest {

    @Mock
    private StatusRepository statusRepository;

    @Mock
    private StatusRequest statusRequest;

    @InjectMocks
    private StatusService statusService;

    @Test
    void getAllStatusesShouldReturnAllStatuses() {

        StatusModel status = createStatus(
                1L,
                "CUSTOM",
                true);

        when(statusRepository.findAllOrderedById())
                .thenReturn(List.of(status));

        List<StatusResponse> result = statusService.getAllStatuses();

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getIdStatus())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("CUSTOM");

        assertThat(result.get(0).isActive())
                .isTrue();

        verify(statusRepository).findAllOrderedById();
    }

    @Test
    void getActiveStatusesShouldReturnActiveStatuses() {

        StatusModel status = createStatus(
                1L,
                "CUSTOM",
                true);

        when(statusRepository.findByActiveTrueOrderByIdStatusAsc())
                .thenReturn(List.of(status));

        List<StatusResponse> result = statusService.getActiveStatuses();

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getIdStatus())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("CUSTOM");

        assertThat(result.get(0).isActive())
                .isTrue();

        verify(statusRepository)
                .findByActiveTrueOrderByIdStatusAsc();
    }

    @Test
    void getStatusByIdShouldReturnStatus() {

        Long statusId = 1L;

        StatusModel status = createStatus(
                statusId,
                "CUSTOM",
                true);

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        StatusResponse result = statusService.getStatusById(statusId);

        assertThat(result.getIdStatus())
                .isEqualTo(statusId);

        assertThat(result.getName())
                .isEqualTo("CUSTOM");

        assertThat(result.isActive())
                .isTrue();

        verify(statusRepository).findById(statusId);
    }

    @Test
    void getStatusByIdShouldThrowExceptionWhenStatusDoesNotExist() {

        Long statusId = 1L;

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> statusService.getStatusById(statusId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Status with id " + statusId + " not found");

        verify(statusRepository).findById(statusId);
    }

    @Test
    void createStatusShouldCreateAndReturnStatus() {

        when(statusRequest.getName())
                .thenReturn("CUSTOM");

        when(statusRepository.existsByName("CUSTOM"))
                .thenReturn(false);

        when(statusRepository.save(any(StatusModel.class)))
                .thenAnswer(invocation -> {

                    StatusModel status = invocation.getArgument(0);

                    status.setIdStatus(1L);

                    return status;
                });

        StatusResponse result = statusService.createStatus(statusRequest);

        assertThat(result.getIdStatus())
                .isEqualTo(1L);

        assertThat(result.getName())
                .isEqualTo("CUSTOM");

        assertThat(result.isActive())
                .isTrue();

        ArgumentCaptor<StatusModel> statusCaptor = ArgumentCaptor.forClass(StatusModel.class);

        verify(statusRepository)
                .save(statusCaptor.capture());

        StatusModel savedStatus = statusCaptor.getValue();

        assertThat(savedStatus.getName())
                .isEqualTo("CUSTOM");

        assertThat(savedStatus.isActive())
                .isTrue();

        verify(statusRepository)
                .existsByName("CUSTOM");
    }

    @Test
    void createStatusShouldThrowExceptionWhenStatusAlreadyExists() {

        when(statusRequest.getName())
                .thenReturn("CUSTOM");

        when(statusRepository.existsByName("CUSTOM"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> statusService.createStatus(statusRequest))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Status 'CUSTOM' already exists");

        verify(statusRepository)
                .existsByName("CUSTOM");

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }

    @Test
    void updateStatusShouldUpdateStatus() {

        Long statusId = 1L;

        StatusModel status = createStatus(
                statusId,
                "CUSTOM",
                true);

        when(statusRequest.getName())
                .thenReturn("NEW_STATUS");

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        when(statusRepository.existsByName("NEW_STATUS"))
                .thenReturn(false);

        when(statusRepository.save(status))
                .thenReturn(status);

        StatusResponse result = statusService.updateStatus(
                statusRequest,
                statusId);

        assertThat(result.getIdStatus())
                .isEqualTo(statusId);

        assertThat(result.getName())
                .isEqualTo("NEW_STATUS");

        assertThat(result.isActive())
                .isTrue();

        verify(statusRepository)
                .findById(statusId);

        verify(statusRepository)
                .existsByName("NEW_STATUS");

        verify(statusRepository)
                .save(status);
    }

    @Test
    void updateStatusShouldNotCheckDuplicateWhenNameDoesNotChange() {

        Long statusId = 1L;

        StatusModel status = createStatus(
                statusId,
                "CUSTOM",
                true);

        when(statusRequest.getName())
                .thenReturn("CUSTOM");

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        when(statusRepository.save(status))
                .thenReturn(status);

        StatusResponse result = statusService.updateStatus(
                statusRequest,
                statusId);

        assertThat(result.getName())
                .isEqualTo("CUSTOM");

        verify(statusRepository, never())
                .existsByName("CUSTOM");

        verify(statusRepository)
                .save(status);
    }

    @Test
    void updateStatusShouldNotCheckDuplicateWhenOnlyCaseChanges() {

        Long statusId = 1L;

        StatusModel status = createStatus(
                statusId,
                "CUSTOM",
                true);

        when(statusRequest.getName())
                .thenReturn("custom");

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        when(statusRepository.save(status))
                .thenReturn(status);

        StatusResponse result = statusService.updateStatus(
                statusRequest,
                statusId);

        assertThat(result.getName())
                .isEqualTo("custom");

        verify(statusRepository, never())
                .existsByName("custom");

        verify(statusRepository)
                .save(status);
    }

    @Test
    void updateStatusShouldThrowExceptionWhenNewNameAlreadyExists() {

        Long statusId = 1L;

        StatusModel status = createStatus(
                statusId,
                "CUSTOM",
                true);

        when(statusRequest.getName())
                .thenReturn("EXISTING_STATUS");

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        when(statusRepository.existsByName("EXISTING_STATUS"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> statusService.updateStatus(
                        statusRequest,
                        statusId))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Status 'EXISTING_STATUS' already exists");

        verify(statusRepository, never())
                .save(status);
    }

    @Test
    void updateStatusShouldThrowExceptionWhenStatusDoesNotExist() {

        Long statusId = 1L;

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> statusService.updateStatus(
                        statusRequest,
                        statusId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Status with id " + statusId + " not found");

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }

    @Test
    void updateStatusShouldThrowExceptionWhenStatusIsProtected() {

        Long statusId = 1L;

        String protectedStatusName = getProtectedStatusName();

        StatusModel status = createStatus(
                statusId,
                protectedStatusName,
                true);

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        assertThatThrownBy(
                () -> statusService.updateStatus(
                        statusRequest,
                        statusId))
                .isInstanceOf(ProtectedResourceException.class)
                .hasMessage(
                        "System status '"
                                + protectedStatusName
                                + "' cannot be modified");

        verify(statusRepository, never())
                .save(status);
    }

    @Test
    void deactivateStatusShouldDeactivateStatus() {

        Long statusId = 1L;

        StatusModel status = createStatus(
                statusId,
                "CUSTOM",
                true);

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        statusService.deactivateStatus(statusId);

        assertThat(status.isActive())
                .isFalse();

        verify(statusRepository)
                .findById(statusId);

        verify(statusRepository)
                .save(status);
    }

    @Test
    void deactivateStatusShouldThrowExceptionWhenStatusIsProtected() {

        Long statusId = 1L;

        String protectedStatusName = getProtectedStatusName();

        StatusModel status = createStatus(
                statusId,
                protectedStatusName,
                true);

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        assertThatThrownBy(
                () -> statusService.deactivateStatus(statusId))
                .isInstanceOf(ProtectedResourceException.class)
                .hasMessage(
                        "System status '"
                                + protectedStatusName
                                + "' cannot be deactivated");

        assertThat(status.isActive())
                .isTrue();

        verify(statusRepository, never())
                .save(status);
    }

    @Test
    void deactivateStatusShouldThrowExceptionWhenStatusDoesNotExist() {

        Long statusId = 1L;

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> statusService.deactivateStatus(statusId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Status with id " + statusId + " not found");

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }

    @Test
    void activateStatusShouldActivateStatus() {

        Long statusId = 1L;

        StatusModel status = createStatus(
                statusId,
                "CUSTOM",
                false);

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.of(status));

        statusService.activateStatus(statusId);

        assertThat(status.isActive())
                .isTrue();

        verify(statusRepository)
                .findById(statusId);

        verify(statusRepository)
                .save(status);
    }

    @Test
    void activateStatusShouldThrowExceptionWhenStatusDoesNotExist() {

        Long statusId = 1L;

        when(statusRepository.findById(statusId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> statusService.activateStatus(statusId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Status with id " + statusId + " not found");

        verify(statusRepository, never())
                .save(any(StatusModel.class));
    }

    private StatusModel createStatus(
            Long id,
            String name,
            boolean active) {

        StatusModel status = new StatusModel();

        status.setIdStatus(id);
        status.setName(name);
        status.setActive(active);

        return status;
    }

    private String getProtectedStatusName() {

        return Arrays.stream(ProtectedStatus.values())
                .map(Enum::name)
                .filter(ProtectedStatus::isProtectedStatus)
                .findFirst()
                .orElseThrow();
    }
}