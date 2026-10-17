package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
public class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private DepartmentService departmentService;

    // =========================================================
    // GET ALL DEPARTMENTS
    // =========================================================
    @Test
    void shouldReturnAllDepartments() {

        DepartmentModel department1 = new DepartmentModel(1L, "IT", true);

        DepartmentModel department2 = new DepartmentModel(2L, "Finance", true);

        List<DepartmentModel> departments = List.of(department1, department2);

        when(departmentRepository.findAllOrderedById())
                .thenReturn(departments);

        List<DepartmentResponse> response = departmentService.getAllDepartments();

        assertEquals(2, response.size());
        assertEquals("IT", response.get(0).getName());
        assertEquals("Finance", response.get(1).getName());
    }

    @Test
    void shouldReturnEmptyListWhenNoDepartmentsExist() {

        when(departmentRepository.findAllOrderedById())
                .thenReturn(List.of());

        List<DepartmentResponse> response = departmentService.getAllDepartments();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET ACTIVE DEPARTMENTS
    // =========================================================
    @Test
    void shouldReturnActiveDepartments() {

        DepartmentModel department1 = new DepartmentModel(1L, "IT", true);

        DepartmentModel department2 = new DepartmentModel(2L, "Finance", true);

        List<DepartmentModel> departments = List.of(department1, department2);

        when(departmentRepository.findByActiveTrueOrderByIdDepartmentAsc())
                .thenReturn(departments);

        List<DepartmentResponse> response = departmentService.getActiveDepartments();

        assertEquals(2, response.size());

        assertEquals("IT", response.get(0).getName());
        assertEquals("Finance", response.get(1).getName());

        assertTrue(response.get(0).isActive());
        assertTrue(response.get(1).isActive());
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveDepartmentsExist() {

        when(departmentRepository.findByActiveTrueOrderByIdDepartmentAsc())
                .thenReturn(List.of());

        List<DepartmentResponse> response = departmentService.getActiveDepartments();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET DEPARTMENT BY ID
    // =========================================================
    @Test
    void shouldReturnDepartmentById() {

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        DepartmentResponse response = departmentService.getDepartmentById(1L);

        assertEquals(1L, response.getIdDepartment());
        assertEquals("IT", response.getName());
        assertTrue(response.isActive());
    }

    @Test
    void shouldThrowExceptionWhenDepartmentByIdDoesNotExist() {

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> departmentService.getDepartmentById(99L));
    }

    // =========================================================
    // CREATE DEPARTMENT
    // =========================================================
    @Test
    void shouldCreateDepartmentSuccessfully() {

        DepartmentRequest request = new DepartmentRequest("IT");

        DepartmentModel savedDepartment = new DepartmentModel(1L, "IT", true);

        when(departmentRepository.existsByName("IT"))
                .thenReturn(false);

        when(departmentRepository.save(any(DepartmentModel.class)))
                .thenReturn(savedDepartment);

        DepartmentResponse response = departmentService.createDepartment(request);

        assertEquals(1L, response.getIdDepartment());
        assertEquals("IT", response.getName());
        assertTrue(response.isActive());

        verify(departmentRepository)
                .existsByName("IT");

        verify(departmentRepository)
                .save(any(DepartmentModel.class));
    }

    @Test
    void shouldThrowExceptionWhenDepartmentAlreadyExists() {

        DepartmentRequest request = new DepartmentRequest("IT");

        when(departmentRepository.existsByName("IT"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> departmentService.createDepartment(request));

        verify(departmentRepository)
                .existsByName("IT");

        verify(departmentRepository, never())
                .save(any(DepartmentModel.class));
    }

    // =========================================================
    // UPDATE DEPARTMENT
    // =========================================================
    @Test
    void shouldUpdateDepartmentSuccessfully() {

        DepartmentRequest request = new DepartmentRequest("Finance");

        DepartmentModel existingDepartment = new DepartmentModel(1L, "IT", true);

        DepartmentModel updatedDepartment = new DepartmentModel(1L, "Finance", true);

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(existingDepartment));

        when(departmentRepository.existsByName("Finance"))
                .thenReturn(false);

        when(departmentRepository.save(any(DepartmentModel.class)))
                .thenReturn(updatedDepartment);

        DepartmentResponse response = departmentService.updateDepartment(1L, request);

        assertEquals(1L, response.getIdDepartment());
        assertEquals("Finance", response.getName());
        assertTrue(response.isActive());

        verify(departmentRepository)
                .findById(1L);

        verify(departmentRepository)
                .existsByName("Finance");

        verify(departmentRepository)
                .save(any(DepartmentModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingDepartment() {

        DepartmentRequest request = new DepartmentRequest("Finance");

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> departmentService.updateDepartment(99L, request));

        verify(departmentRepository)
                .findById(99L);

        verify(departmentRepository, never())
                .save(any(DepartmentModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingDepartmentWithExistingName() {

        DepartmentRequest request = new DepartmentRequest("Finance");

        DepartmentModel existingDepartment = new DepartmentModel(1L, "IT", true);

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(existingDepartment));

        when(departmentRepository.existsByName("Finance"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> departmentService.updateDepartment(1L, request));

        verify(departmentRepository)
                .findById(1L);

        verify(departmentRepository)
                .existsByName("Finance");

        verify(departmentRepository, never())
                .save(any(DepartmentModel.class));
    }

    // =========================================================
    // DEACTIVATE DEPARTMENT
    // =========================================================
    @Test
    void shouldDeactivateDepartmentSuccessfully() {

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.save(any(DepartmentModel.class)))
                .thenReturn(department);

        departmentService.deactivateDepartment(1L);

        assertFalse(department.isActive());

        verify(departmentRepository)
                .findById(1L);

        verify(departmentRepository)
                .save(department);
    }

    @Test
    void shouldThrowExceptionWhenDeactivatingNonExistingDepartment() {

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> departmentService.deactivateDepartment(99L));

        verify(departmentRepository)
                .findById(99L);

        verify(departmentRepository, never())
                .save(any(DepartmentModel.class));
    }

    // =========================================================
    // ACTIVATE DEPARTMENT
    // =========================================================
    @Test
    void shouldActivateDepartmentSuccessfully() {

        DepartmentModel department = new DepartmentModel(1L, "IT", false);

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.save(any(DepartmentModel.class)))
                .thenReturn(department);

        departmentService.activateDepartment(1L);

        assertTrue(department.isActive());

        verify(departmentRepository)
                .findById(1L);

        verify(departmentRepository)
                .save(department);
    }

    @Test
    void shouldThrowExceptionWhenActivatingNonExistingDepartment() {

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> departmentService.activateDepartment(99L));

        verify(departmentRepository)
                .findById(99L);

        verify(departmentRepository, never())
                .save(any(DepartmentModel.class));
    }
}
