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

import com.example.back_end.dtos.priority.PriorityRequest;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.enums.ProtectedPriority;
import com.example.back_end.exception.ProtectedResourceException;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.PriorityModel;
import com.example.back_end.repository.PriorityRepository;

@ExtendWith(MockitoExtension.class)
class PriorityServiceTest {

    @Mock
    private PriorityRepository priorityRepository;

    @Mock
    private PriorityRequest priorityRequest;

    @InjectMocks
    private PriorityService priorityService;

    @Test
    void getAllPrioritiesShouldReturnAllPriorities() {

        PriorityModel priority = createPriority(
                1L,
                "CUSTOM",
                true);

        when(priorityRepository.findAllOrderedById())
                .thenReturn(List.of(priority));

        List<PriorityResponse> result = priorityService.getAllPriorities();

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getIdPriority())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("CUSTOM");

        assertThat(result.get(0).isActive())
                .isTrue();

        verify(priorityRepository).findAllOrderedById();
    }

    @Test
    void getActivePrioritiesShouldReturnActivePriorities() {

        PriorityModel priority = createPriority(
                1L,
                "CUSTOM",
                true);

        when(priorityRepository.findByActiveTrueOrderByIdPriorityAsc())
                .thenReturn(List.of(priority));

        List<PriorityResponse> result = priorityService.getActivePriorities();

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getIdPriority())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("CUSTOM");

        assertThat(result.get(0).isActive())
                .isTrue();

        verify(priorityRepository)
                .findByActiveTrueOrderByIdPriorityAsc();
    }

    @Test
    void getPriorityByIdShouldReturnPriority() {

        Long priorityId = 1L;

        PriorityModel priority = createPriority(
                priorityId,
                "CUSTOM",
                true);

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        PriorityResponse result = priorityService.getPriorityById(priorityId);

        assertThat(result.getIdPriority())
                .isEqualTo(priorityId);

        assertThat(result.getName())
                .isEqualTo("CUSTOM");

        assertThat(result.isActive())
                .isTrue();

        verify(priorityRepository).findById(priorityId);
    }

    @Test
    void getPriorityByIdShouldThrowExceptionWhenPriorityDoesNotExist() {

        Long priorityId = 1L;

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> priorityService.getPriorityById(priorityId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Priority with id " + priorityId + " not found");

        verify(priorityRepository).findById(priorityId);
    }

    @Test
    void createPriorityShouldCreateAndReturnPriority() {

        when(priorityRequest.getName())
                .thenReturn("CUSTOM");

        when(priorityRepository.existsByName("CUSTOM"))
                .thenReturn(false);

        when(priorityRepository.save(any(PriorityModel.class)))
                .thenAnswer(invocation -> {

                    PriorityModel priority = invocation.getArgument(0);

                    priority.setIdPriority(1L);

                    return priority;
                });

        PriorityResponse result = priorityService.createPriority(priorityRequest);

        assertThat(result.getIdPriority())
                .isEqualTo(1L);

        assertThat(result.getName())
                .isEqualTo("CUSTOM");

        assertThat(result.isActive())
                .isTrue();

        ArgumentCaptor<PriorityModel> priorityCaptor = ArgumentCaptor.forClass(PriorityModel.class);

        verify(priorityRepository)
                .save(priorityCaptor.capture());

        PriorityModel savedPriority = priorityCaptor.getValue();

        assertThat(savedPriority.getName())
                .isEqualTo("CUSTOM");

        assertThat(savedPriority.isActive())
                .isTrue();

        verify(priorityRepository)
                .existsByName("CUSTOM");
    }

    @Test
    void createPriorityShouldThrowExceptionWhenPriorityAlreadyExists() {

        when(priorityRequest.getName())
                .thenReturn("CUSTOM");

        when(priorityRepository.existsByName("CUSTOM"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> priorityService.createPriority(priorityRequest))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Priority 'CUSTOM' already exists");

        verify(priorityRepository)
                .existsByName("CUSTOM");

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }

    @Test
    void updatePriorityShouldUpdatePriority() {

        Long priorityId = 1L;

        PriorityModel priority = createPriority(
                priorityId,
                "CUSTOM",
                true);

        when(priorityRequest.getName())
                .thenReturn("NEW_PRIORITY");

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        when(priorityRepository.existsByName("NEW_PRIORITY"))
                .thenReturn(false);

        when(priorityRepository.save(priority))
                .thenReturn(priority);

        PriorityResponse result = priorityService.updatePriority(
                priorityRequest,
                priorityId);

        assertThat(result.getIdPriority())
                .isEqualTo(priorityId);

        assertThat(result.getName())
                .isEqualTo("NEW_PRIORITY");

        assertThat(result.isActive())
                .isTrue();

        verify(priorityRepository)
                .findById(priorityId);

        verify(priorityRepository)
                .existsByName("NEW_PRIORITY");

        verify(priorityRepository)
                .save(priority);
    }

    @Test
    void updatePriorityShouldNotCheckDuplicateWhenNameDoesNotChange() {

        Long priorityId = 1L;

        PriorityModel priority = createPriority(
                priorityId,
                "CUSTOM",
                true);

        when(priorityRequest.getName())
                .thenReturn("CUSTOM");

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        when(priorityRepository.save(priority))
                .thenReturn(priority);

        PriorityResponse result = priorityService.updatePriority(
                priorityRequest,
                priorityId);

        assertThat(result.getName())
                .isEqualTo("CUSTOM");

        verify(priorityRepository, never())
                .existsByName("CUSTOM");

        verify(priorityRepository)
                .save(priority);
    }

    @Test
    void updatePriorityShouldNotCheckDuplicateWhenOnlyCaseChanges() {

        Long priorityId = 1L;

        PriorityModel priority = createPriority(
                priorityId,
                "CUSTOM",
                true);

        when(priorityRequest.getName())
                .thenReturn("custom");

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        when(priorityRepository.save(priority))
                .thenReturn(priority);

        PriorityResponse result = priorityService.updatePriority(
                priorityRequest,
                priorityId);

        assertThat(result.getName())
                .isEqualTo("custom");

        verify(priorityRepository, never())
                .existsByName("custom");

        verify(priorityRepository)
                .save(priority);
    }

    @Test
    void updatePriorityShouldThrowExceptionWhenNewNameAlreadyExists() {

        Long priorityId = 1L;

        PriorityModel priority = createPriority(
                priorityId,
                "CUSTOM",
                true);

        when(priorityRequest.getName())
                .thenReturn("EXISTING_PRIORITY");

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        when(priorityRepository.existsByName("EXISTING_PRIORITY"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> priorityService.updatePriority(
                        priorityRequest,
                        priorityId))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Priority 'EXISTING_PRIORITY' already exists");

        verify(priorityRepository, never())
                .save(priority);
    }

    @Test
    void updatePriorityShouldThrowExceptionWhenPriorityDoesNotExist() {

        Long priorityId = 1L;

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> priorityService.updatePriority(
                        priorityRequest,
                        priorityId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Priority with id " + priorityId + " not found");

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }

    @Test
    void updatePriorityShouldThrowExceptionWhenPriorityIsProtected() {

        Long priorityId = 1L;

        String protectedPriorityName = getProtectedPriorityName();

        PriorityModel priority = createPriority(
                priorityId,
                protectedPriorityName,
                true);

        when(priorityRequest.getName())
                .thenReturn(protectedPriorityName);

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        assertThatThrownBy(
                () -> priorityService.updatePriority(
                        priorityRequest,
                        priorityId))
                .isInstanceOf(ProtectedResourceException.class)
                .hasMessage(
                        "Priority '"
                                + protectedPriorityName
                                + "' cannot be modified");

        verify(priorityRepository, never())
                .save(priority);
    }

    @Test
    void deactivatePriorityShouldDeactivatePriority() {

        Long priorityId = 1L;

        PriorityModel priority = createPriority(
                priorityId,
                "CUSTOM",
                true);

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        priorityService.deactivatePriority(priorityId);

        assertThat(priority.isActive())
                .isFalse();

        verify(priorityRepository)
                .findById(priorityId);

        verify(priorityRepository)
                .save(priority);
    }

    @Test
    void deactivatePriorityShouldThrowExceptionWhenPriorityIsProtected() {

        Long priorityId = 1L;

        String protectedPriorityName = getProtectedPriorityName();

        PriorityModel priority = createPriority(
                priorityId,
                protectedPriorityName,
                true);

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        assertThatThrownBy(
                () -> priorityService.deactivatePriority(priorityId))
                .isInstanceOf(ProtectedResourceException.class)
                .hasMessage(
                        "Priority '"
                                + protectedPriorityName
                                + "' cannot be deactivated");

        assertThat(priority.isActive())
                .isTrue();

        verify(priorityRepository, never())
                .save(priority);
    }

    @Test
    void deactivatePriorityShouldThrowExceptionWhenPriorityDoesNotExist() {

        Long priorityId = 1L;

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> priorityService.deactivatePriority(priorityId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Priority with id " + priorityId + " not found");

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }

    @Test
    void activatePriorityShouldActivatePriority() {

        Long priorityId = 1L;

        PriorityModel priority = createPriority(
                priorityId,
                "CUSTOM",
                false);

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.of(priority));

        priorityService.activatePriority(priorityId);

        assertThat(priority.isActive())
                .isTrue();

        verify(priorityRepository)
                .findById(priorityId);

        verify(priorityRepository)
                .save(priority);
    }

    @Test
    void activatePriorityShouldThrowExceptionWhenPriorityDoesNotExist() {

        Long priorityId = 1L;

        when(priorityRepository.findById(priorityId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> priorityService.activatePriority(priorityId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Priority with id " + priorityId + " not found");

        verify(priorityRepository, never())
                .save(any(PriorityModel.class));
    }

    private PriorityModel createPriority(
            Long id,
            String name,
            boolean active) {

        PriorityModel priority = new PriorityModel();

        priority.setIdPriority(id);
        priority.setName(name);
        priority.setActive(active);

        return priority;
    }

    private String getProtectedPriorityName() {

        return Arrays.stream(ProtectedPriority.values())
                .map(Enum::name)
                .filter(ProtectedPriority::isProtectedPriority)
                .findFirst()
                .orElseThrow();
    }
}