package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.back_end.dtos.department.DepartmentRequest;
import com.example.back_end.dtos.department.DepartmentResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.repository.DepartmentRepository;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private DepartmentRequest departmentRequest;

    @InjectMocks
    private DepartmentService departmentService;

    @Test
    void getAllDepartmentsShouldReturnAllDepartments() {

        DepartmentModel department = createDepartment(
                1L,
                "IT",
                true);

        when(departmentRepository.findAllOrderedById())
                .thenReturn(List.of(department));

        List<DepartmentResponse> result = departmentService.getAllDepartments();

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getIdDepartment())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("IT");

        assertThat(result.get(0).isActive())
                .isTrue();

        verify(departmentRepository).findAllOrderedById();
    }

    @Test
    void getActiveDepartmentsShouldReturnActiveDepartments() {

        DepartmentModel department = createDepartment(
                1L,
                "IT",
                true);

        when(departmentRepository.findByActiveTrueOrderByIdDepartmentAsc())
                .thenReturn(List.of(department));

        List<DepartmentResponse> result = departmentService.getActiveDepartments();

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getIdDepartment())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("IT");

        assertThat(result.get(0).isActive())
                .isTrue();

        verify(departmentRepository)
                .findByActiveTrueOrderByIdDepartmentAsc();
    }

    @Test
    void getDepartmentByIdShouldReturnDepartment() {

        Long departmentId = 1L;

        DepartmentModel department = createDepartment(
                departmentId,
                "IT",
                true);

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.of(department));

        DepartmentResponse result = departmentService.getDepartmentById(departmentId);

        assertThat(result.getIdDepartment())
                .isEqualTo(departmentId);

        assertThat(result.getName())
                .isEqualTo("IT");

        assertThat(result.isActive())
                .isTrue();

        verify(departmentRepository)
                .findById(departmentId);
    }

    @Test
    void getDepartmentByIdShouldThrowExceptionWhenDepartmentDoesNotExist() {

        Long departmentId = 1L;

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> departmentService.getDepartmentById(departmentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Department with id " + departmentId + " not found");

        verify(departmentRepository)
                .findById(departmentId);
    }

    @Test
    void createDepartmentShouldCreateAndReturnDepartment() {

        when(departmentRequest.getName())
                .thenReturn("IT");

        when(departmentRepository.existsByName("IT"))
                .thenReturn(false);

        when(departmentRepository.save(
                org.mockito.ArgumentMatchers.any(DepartmentModel.class)))
                .thenAnswer(invocation -> {

                    DepartmentModel department = invocation.getArgument(0);

                    department.setIdDepartment(1L);

                    return department;
                });

        DepartmentResponse result = departmentService.createDepartment(departmentRequest);

        assertThat(result.getIdDepartment())
                .isEqualTo(1L);

        assertThat(result.getName())
                .isEqualTo("IT");

        assertThat(result.isActive())
                .isTrue();

        ArgumentCaptor<DepartmentModel> departmentCaptor = ArgumentCaptor.forClass(DepartmentModel.class);

        verify(departmentRepository)
                .save(departmentCaptor.capture());

        DepartmentModel savedDepartment = departmentCaptor.getValue();

        assertThat(savedDepartment.getName())
                .isEqualTo("IT");

        assertThat(savedDepartment.isActive())
                .isTrue();

        verify(departmentRepository)
                .existsByName("IT");
    }

    @Test
    void createDepartmentShouldThrowExceptionWhenDepartmentAlreadyExists() {

        when(departmentRequest.getName())
                .thenReturn("IT");

        when(departmentRepository.existsByName("IT"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> departmentService.createDepartment(departmentRequest))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Department 'IT' already exists");

        verify(departmentRepository)
                .existsByName("IT");

        verify(departmentRepository, never())
                .save(
                        org.mockito.ArgumentMatchers.any(
                                DepartmentModel.class));
    }

    @Test
    void updateDepartmentShouldUpdateDepartment() {

        Long departmentId = 1L;

        DepartmentModel existingDepartment = createDepartment(
                departmentId,
                "IT",
                true);

        when(departmentRequest.getName())
                .thenReturn("Finance");

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.of(existingDepartment));

        when(departmentRepository.existsByName("Finance"))
                .thenReturn(false);

        when(departmentRepository.save(existingDepartment))
                .thenReturn(existingDepartment);

        DepartmentResponse result = departmentService.updateDepartment(
                departmentId,
                departmentRequest);

        assertThat(result.getIdDepartment())
                .isEqualTo(departmentId);

        assertThat(result.getName())
                .isEqualTo("Finance");

        assertThat(result.isActive())
                .isTrue();

        verify(departmentRepository)
                .findById(departmentId);

        verify(departmentRepository)
                .existsByName("Finance");

        verify(departmentRepository)
                .save(existingDepartment);
    }

    @Test
    void updateDepartmentShouldNotCheckDuplicateWhenNameDoesNotChange() {

        Long departmentId = 1L;

        DepartmentModel existingDepartment = createDepartment(
                departmentId,
                "IT",
                true);

        when(departmentRequest.getName())
                .thenReturn("IT");

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.of(existingDepartment));

        when(departmentRepository.save(existingDepartment))
                .thenReturn(existingDepartment);

        DepartmentResponse result = departmentService.updateDepartment(
                departmentId,
                departmentRequest);

        assertThat(result.getName())
                .isEqualTo("IT");

        verify(departmentRepository)
                .findById(departmentId);

        verify(departmentRepository, never())
                .existsByName("IT");

        verify(departmentRepository)
                .save(existingDepartment);
    }

    @Test
    void updateDepartmentShouldNotCheckDuplicateWhenOnlyCaseChanges() {

        Long departmentId = 1L;

        DepartmentModel existingDepartment = createDepartment(
                departmentId,
                "IT",
                true);

        when(departmentRequest.getName())
                .thenReturn("it");

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.of(existingDepartment));

        when(departmentRepository.save(existingDepartment))
                .thenReturn(existingDepartment);

        DepartmentResponse result = departmentService.updateDepartment(
                departmentId,
                departmentRequest);

        assertThat(result.getName())
                .isEqualTo("it");

        verify(departmentRepository)
                .findById(departmentId);

        verify(departmentRepository, never())
                .existsByName("it");

        verify(departmentRepository)
                .save(existingDepartment);
    }

    @Test
    void updateDepartmentShouldThrowExceptionWhenNewNameAlreadyExists() {

        Long departmentId = 1L;

        DepartmentModel existingDepartment = createDepartment(
                departmentId,
                "IT",
                true);

        when(departmentRequest.getName())
                .thenReturn("Finance");

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.of(existingDepartment));

        when(departmentRepository.existsByName("Finance"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> departmentService.updateDepartment(
                        departmentId,
                        departmentRequest))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Department 'Finance' already exists");

        verify(departmentRepository)
                .findById(departmentId);

        verify(departmentRepository)
                .existsByName("Finance");

        verify(departmentRepository, never())
                .save(existingDepartment);
    }

    @Test
    void updateDepartmentShouldThrowExceptionWhenDepartmentDoesNotExist() {

        Long departmentId = 1L;

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> departmentService.updateDepartment(
                        departmentId,
                        departmentRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Department with id " + departmentId + " not found");

        verify(departmentRepository)
                .findById(departmentId);

        verify(departmentRepository, never())
                .save(
                        org.mockito.ArgumentMatchers.any(
                                DepartmentModel.class));
    }

    @Test
    void deactivateDepartmentShouldDeactivateDepartment() {

        Long departmentId = 1L;

        DepartmentModel department = createDepartment(
                departmentId,
                "IT",
                true);

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.of(department));

        departmentService.deactivateDepartment(departmentId);

        assertThat(department.isActive())
                .isFalse();

        verify(departmentRepository)
                .findById(departmentId);

        verify(departmentRepository)
                .save(department);
    }

    @Test
    void deactivateDepartmentShouldThrowExceptionWhenDepartmentDoesNotExist() {

        Long departmentId = 1L;

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> departmentService.deactivateDepartment(departmentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Department with id " + departmentId + " not found");

        verify(departmentRepository)
                .findById(departmentId);
    }

    @Test
    void activateDepartmentShouldActivateDepartment() {

        Long departmentId = 1L;

        DepartmentModel department = createDepartment(
                departmentId,
                "IT",
                false);

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.of(department));

        departmentService.activateDepartment(departmentId);

        assertThat(department.isActive())
                .isTrue();

        verify(departmentRepository)
                .findById(departmentId);

        verify(departmentRepository)
                .save(department);
    }

    @Test
    void activateDepartmentShouldThrowExceptionWhenDepartmentDoesNotExist() {

        Long departmentId = 1L;

        when(departmentRepository.findById(departmentId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> departmentService.activateDepartment(departmentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Department with id " + departmentId + " not found");

        verify(departmentRepository)
                .findById(departmentId);
    }

    private DepartmentModel createDepartment(
            Long id,
            String name,
            boolean active) {

        DepartmentModel department = new DepartmentModel();

        department.setIdDepartment(id);
        department.setName(name);
        department.setActive(active);

        return department;
    }
}